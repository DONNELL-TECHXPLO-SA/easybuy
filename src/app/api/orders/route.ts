import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const checkoutSchema = z.object({
  billing: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional().default(""),
    country: z.string().min(1, "Country is required"),
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional().default(""),
    city: z.string().min(1, "City is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Invalid email address"),
  }),
  shipping: z
    .object({
      firstName: z.string().optional().default(""),
      lastName: z.string().optional().default(""),
      country: z.string().optional().default(""),
      address: z.string().optional().default(""),
      address2: z.string().optional().default(""),
      city: z.string().optional().default(""),
    })
    .optional(),
  shippingMethod: z.enum(["free", "fedex", "dhl"]).default("free"),
  paymentMethod: z.enum(["bank", "cash", "paypal"]).default("bank"),
  notes: z.string().optional().default(""),
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
          thumbnail_image
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const { billing, shipping, shippingMethod, paymentMethod, notes } =
      parsed.data;

    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        quantity,
        products (
          id,
          title,
          price,
          discounted_price,
          thumbnail_images
        )
      `
      )
      .eq("user_id", user.id) as {
        data: Array<{
          quantity: number;
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
        { status: 500 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const shippingCosts: Record<string, number> = {
      free: 0,
      fedex: 10.99,
      dhl: 12.5,
    };

    const shippingCost = shippingCosts[shippingMethod];
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.products.discounted_price * item.quantity,
      0
    );
    const total = subtotal + shippingCost;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
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
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderItemsPayload = cartItems.map((item) => ({
      order_id: (order as { id: string }).id,
      product_id: item.products.id,
      title: item.products.title,
      price: item.products.price,
      discounted_price: item.products.discounted_price,
      quantity: item.quantity,
      thumbnail_image: item.products.thumbnail_images?.[0] || "",
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload as never);

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    await supabase.from("cart_items").delete().eq("user_id", user.id);

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
