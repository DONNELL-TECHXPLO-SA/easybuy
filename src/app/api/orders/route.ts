import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getPayFastUrl } from "@/lib/payfast";
import { calculateShipping } from "@/lib/shipping/calculateShipping";
import {
  ShippingCalculationError,
  ShippingMethod,
  ShippingRateRule,
  ShippingZone,
} from "@/types/shipping";

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const checkoutSchema = z.object({
  billing: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional().default(""),
    country: z.string().min(1, "Country is required"),
    region: z.string().optional().default(""),
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional().default(""),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Invalid email address"),
  }),
  shipping: z
    .object({
      firstName: z.string().optional().default(""),
      lastName: z.string().optional().default(""),
      country: z.string().optional().default(""),
      region: z.string().optional().default(""),
      address: z.string().optional().default(""),
      address2: z.string().optional().default(""),
      city: z.string().optional().default(""),
      postalCode: z.string().optional().default(""),
    })
    .optional(),
  shippingMethod: z
    .string()
    .min(1, "Shipping method is required")
    .default("free"),
  notes: z.string().optional().default(""),
  cartItems: z
    .array(
      z.object({
        id: z.number(),
        title: z.string(),
        price: z.number(),
        discountedPrice: z.number(),
        quantity: z.number().int().positive(),
        selectedVariations: z.record(z.string(), z.string()).optional(),
        imgs: z
          .object({
            thumbnails: z.array(z.string()).optional(),
            previews: z.array(z.string()).optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        payment_method,
        shipping_method,
        shipping_method_label,
        shipping_zone_code,
        shipping_eta_min_days,
        shipping_eta_max_days,
        shipping_cost,
        subtotal,
        total,
        billing_first_name,
        billing_last_name,
        billing_email,
        created_at,
        order_items (
          id,
          title,
          price,
          discounted_price,
          quantity,
          thumbnail_image,
          selected_variations
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error("[Order] Order creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      billing,
      shipping,
      shippingMethod,
      notes,
      cartItems: clientCartItems,
    } = parsed.data;

    const { data: cartItems, error: cartError } = (await supabase
      .from("cart_items")
      .select(
        `
        quantity,
        selected_variations,
        products (
          id,
          title,
          price,
          discounted_price,
          thumbnail_images
        )
      `,
      )
      .eq("user_id", user.id)) as {
      data: Array<{
        quantity: number;
        selected_variations: Record<string, string>;
        products: {
          id: number;
          title: string;
          price: number;
          discounted_price: number;
          thumbnail_images: string[];
        };
      }> | null;
      error: unknown;
    };

    if (cartError) {
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 },
      );
    }

    const effectiveCartItems =
      cartItems && cartItems.length > 0
        ? cartItems
        : clientCartItems?.map((item) => ({
            quantity: item.quantity,
            selected_variations: item.selectedVariations || {},
            products: {
              id: item.id,
              title: item.title,
              price: item.price,
              discounted_price: item.discountedPrice,
              thumbnail_images: item.imgs?.thumbnails ?? [],
            },
          }));

    if (!effectiveCartItems || effectiveCartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const results = await Promise.all([
      supabase
        .from("shipping_zones")
        .select(
          "code, name, countries, regions, postal_code_patterns, priority, is_active",
        ),
      supabase
        .from("shipping_methods")
        .select(
          "code, label, carrier, description, sort_order, is_active, allow_free_shipping",
        ),
      supabase.from("shipping_rate_rules").select(
        `
          id,
          min_subtotal,
          max_subtotal,
          min_weight_grams,
          max_weight_grams,
          min_items,
          max_items,
          price,
          eta_min_days,
          eta_max_days,
          sort_order,
          is_active,
          shipping_zones!inner ( code ),
          shipping_methods!inner ( code )
        `,
      ),
      supabase
        .from("shipping_settings")
        .select("free_shipping_threshold")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    const zoneRows = results[0].data as any[] | null;
    const zonesError = results[0].error;
    const methodRows = results[1].data as any[] | null;
    const methodsError = results[1].error;
    const ruleRows = results[2].data as any[] | null;
    const rulesError = results[2].error;
    const settingsRow = results[3].data as any;
    const settingsError = results[3].error;

    if (zonesError || methodsError || rulesError || settingsError) {
      return NextResponse.json(
        { error: "Failed to load shipping configuration" },
        { status: 500 },
      );
    }

    const zones: ShippingZone[] = (zoneRows ?? []).map((row) => ({
      code: String(row.code),
      name: String(row.name),
      countries: toStringArray(row.countries),
      regions: toStringArray(row.regions),
      postalCodePatterns: toStringArray(row.postal_code_patterns),
      priority: Number(row.priority ?? 100),
      isActive: Boolean(row.is_active),
    }));

    const methods: ShippingMethod[] = (methodRows ?? []).map((row) => ({
      code: String(row.code),
      label: String(row.label),
      carrier: String(row.carrier ?? ""),
      description: String(row.description ?? ""),
      sortOrder: Number(row.sort_order ?? 100),
      isActive: Boolean(row.is_active),
      allowFreeShipping: Boolean(row.allow_free_shipping),
    }));

    const rules: ShippingRateRule[] = (ruleRows ?? []).map((row) => ({
      id: Number(row.id),
      zoneCode: String((row.shipping_zones as { code: string }).code),
      methodCode: String((row.shipping_methods as { code: string }).code),
      minSubtotal: row.min_subtotal == null ? null : Number(row.min_subtotal),
      maxSubtotal: row.max_subtotal == null ? null : Number(row.max_subtotal),
      minWeightGrams:
        row.min_weight_grams == null ? null : Number(row.min_weight_grams),
      maxWeightGrams:
        row.max_weight_grams == null ? null : Number(row.max_weight_grams),
      minItems: row.min_items == null ? null : Number(row.min_items),
      maxItems: row.max_items == null ? null : Number(row.max_items),
      price: Number(row.price ?? 0),
      etaMinDays: row.eta_min_days == null ? null : Number(row.eta_min_days),
      etaMaxDays: row.eta_max_days == null ? null : Number(row.eta_max_days),
      sortOrder: Number(row.sort_order ?? 100),
      isActive: Boolean(row.is_active),
    }));

    const shippingCountry = shipping?.country?.trim();
    const shippingPostalCode = shipping?.postalCode?.trim();
    const useShippingDestination = Boolean(
      shippingCountry && shippingPostalCode,
    );

    const destination = useShippingDestination
      ? {
          country: shippingCountry!,
          region: shipping?.region?.trim() || "",
          city: shipping?.city?.trim() || "",
          postalCode: shippingPostalCode!,
        }
      : {
          country: billing.country.trim(),
          region: billing.region?.trim() || "",
          city: billing.city.trim(),
          postalCode: billing.postalCode.trim(),
        };

    let shippingResult;

    try {
      shippingResult = calculateShipping({
        destination,
        cartLines: effectiveCartItems.map((item) => ({
          productId: item.products.id,
          quantity: item.quantity,
          unitPrice: Number(item.products.discounted_price),
        })),
        zones,
        methods,
        rules,
        selectedMethodCode: shippingMethod,
        freeShippingThreshold:
          settingsRow && settingsRow.free_shipping_threshold != null
            ? Number(settingsRow.free_shipping_threshold)
            : null,
      });
    } catch (error) {
      if (error instanceof ShippingCalculationError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to calculate shipping" },
        { status: 500 },
      );
    }

    if (shippingResult.selectedMethodCode !== shippingMethod) {
      return NextResponse.json(
        {
          error:
            "Selected shipping method is unavailable for this destination.",
        },
        { status: 400 },
      );
    }

    const selectedShippingQuote = shippingResult.availableMethods.find(
      (method) => method.methodCode === shippingResult.selectedMethodCode,
    );

    if (!selectedShippingQuote) {
      return NextResponse.json(
        { error: "Failed to resolve selected shipping method." },
        { status: 400 },
      );
    }

    const shippingCost = shippingResult.shippingCost;
    const subtotal = shippingResult.subtotal;
    const total = shippingResult.total;
    const paymentMethod = "payfast";
    const orderStatus = "pending_payment";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: orderStatus,
        payment_method: paymentMethod,
        shipping_method: selectedShippingQuote.methodCode,
        shipping_method_label: selectedShippingQuote.methodLabel,
        shipping_zone_code: selectedShippingQuote.zoneCode,
        shipping_eta_min_days: selectedShippingQuote.etaMinDays ?? null,
        shipping_eta_max_days: selectedShippingQuote.etaMaxDays ?? null,
        shipping_cost: shippingCost,
        subtotal,
        total,
        notes: notes || "",
        billing_first_name: billing.firstName,
        billing_last_name: billing.lastName,
        billing_company: billing.company || "",
        billing_country: billing.country,
        billing_address: billing.address,
        billing_address_2: billing.address2 || "",
        billing_city: billing.city,
        billing_phone: billing.phone,
        billing_email: billing.email,
        shipping_first_name: shipping?.firstName || billing.firstName,
        shipping_last_name: shipping?.lastName || billing.lastName,
        shipping_address: shipping?.address || billing.address,
        shipping_address_2: shipping?.address2 || billing.address2 || "",
        shipping_city: shipping?.city || billing.city,
        shipping_country: shipping?.country || billing.country,
      } as never)
      .select()
      .single();

    if (orderError || !order) {
      console.error("[Order] Order insertion failed:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    const orderId = (order as { id: string }).id;
    console.debug("[Order] Order created successfully:", orderId);

    const orderItemsPayload = effectiveCartItems.map((item) => ({
      order_id: orderId,
      product_id: item.products.id,
      title: item.products.title,
      price: item.products.price,
      discounted_price: item.products.discounted_price,
      quantity: item.quantity,
      thumbnail_image: item.products.thumbnail_images?.[0] || "",
      selected_variations: item.selected_variations,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload as never);

    if (itemsError) {
      console.error("[Order] Order items insertion failed:", itemsError);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 },
      );
    }

    // Create PayFast Redirect URL
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      
      if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
        throw new Error("Missing PayFast merchant credentials in environment variables");
      }

      const redirectUrl = getPayFastUrl({
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: `${appUrl}/my-account?orderId=${orderId}&payment=success`,
        cancel_url: `${appUrl}/checkout`,
        notify_url: `${appUrl}/api/webhooks/payfast`,
        m_payment_id: orderId,
        amount: total.toFixed(2),
        item_name: `Order #${orderId.slice(0, 8)}`,
        name_first: billing.firstName,
        name_last: billing.lastName,
        email_address: billing.email,
        passphrase: process.env.PAYFAST_PASSPHRASE,
      });

      console.debug("[Order] PayFast URL generated:", redirectUrl);

      return NextResponse.json(
        { order, redirectUrl },
        { status: 201 },
      );
    } catch (payfastError) {
      console.error("[Order] PayFast URL generation failed:", payfastError);
      return NextResponse.json(
        { error: "Failed to initialize payment gateway" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[Order] Order creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
