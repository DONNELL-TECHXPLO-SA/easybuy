import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateShipping } from "@/lib/shipping/calculateShipping";
import {
  ShippingCalculationError,
  ShippingMethod,
  ShippingRateRule,
  ShippingZone,
} from "@/types/shipping";
import { withRateLimit } from "@/lib/api-utils";

const quoteSchema = z.object({
  destination: z.object({
    country: z.string().min(1, "Country is required"),
    region: z.string().optional().default(""),
    city: z.string().optional().default(""),
    postalCode: z.string().min(1, "Postal code is required"),
  }),
  selectedMethodCode: z.string().optional(),
});

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export async function POST(request: NextRequest) {
  try {
    const rateCheck = withRateLimit(request, 30);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { destination, selectedMethodCode } = parsed.data;

    const { data: cartRows, error: cartError } = (await supabase
      .from("cart_items")
      .select(
        `
        quantity,
        products (
          id,
          discounted_price
        )
      `,
      )
      .eq("user_id", user.id)) as {
      data: Array<{
        quantity: number;
        products: {
          id: number;
          discounted_price: number;
        } | null;
      }> | null;
      error: unknown;
    };

    if (cartError) {
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 },
      );
    }

    const cartLines = (cartRows ?? [])
      .filter((row) => row.products && row.quantity > 0)
      .map((row) => ({
        productId: row.products!.id,
        quantity: row.quantity,
        unitPrice: Number(row.products!.discounted_price ?? 0),
      }));

    if (cartLines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const results = await Promise.all([
      supabase
        .from("shipping_zones")
        .select(
          "id, code, name, countries, regions, postal_code_patterns, priority, is_active",
        ),
      supabase
        .from("shipping_methods")
        .select(
          "id, code, label, carrier, description, sort_order, is_active, allow_free_shipping",
        ),
      supabase
        .from("shipping_rate_rules")
        .select(
          "id, zone_id, method_id, min_subtotal, max_subtotal, min_weight_grams, max_weight_grams, min_items, max_items, price, eta_min_days, eta_max_days, sort_order, is_active",
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
      console.error("[Shipping Quote] configuration load failed", {
        zonesError,
        methodsError,
        rulesError,
        settingsError,
      });

      return NextResponse.json(
        {
          error: "Failed to load shipping configuration",
          details: {
            zonesError: zonesError ? String(zonesError) : null,
            methodsError: methodsError ? String(methodsError) : null,
            rulesError: rulesError ? String(rulesError) : null,
            settingsError: settingsError ? String(settingsError) : null,
          },
        },
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

    const zoneLookupRows = (zoneRows ?? []) as Array<{
      id: number;
      code: string;
    }>;
    const methodLookupRows = (methodRows ?? []) as Array<{
      id: number;
      code: string;
    }>;
    const ruleLookupRows = (ruleRows ?? []) as Array<{
      id: number;
      zone_id: number;
      method_id: number;
      min_subtotal: number | null;
      max_subtotal: number | null;
      min_weight_grams: number | null;
      max_weight_grams: number | null;
      min_items: number | null;
      max_items: number | null;
      price: number;
      eta_min_days: number | null;
      eta_max_days: number | null;
      sort_order: number;
      is_active: boolean;
    }>;

    const zonesById = new Map(zoneLookupRows.map((zone) => [zone.id, zone]));
    const methodsById = new Map(
      methodLookupRows.map((method) => [method.id, method]),
    );

    const rules: ShippingRateRule[] = ruleLookupRows
      .map((row) => {
        const zone = zonesById.get(Number(row.zone_id));
        const method = methodsById.get(Number(row.method_id));

        if (!zone || !method) {
          return null;
        }

        return {
          id: Number(row.id),
          zoneCode: String(zone.code),
          methodCode: String(method.code),
          minSubtotal:
            row.min_subtotal == null ? null : Number(row.min_subtotal),
          maxSubtotal:
            row.max_subtotal == null ? null : Number(row.max_subtotal),
          minWeightGrams:
            row.min_weight_grams == null ? null : Number(row.min_weight_grams),
          maxWeightGrams:
            row.max_weight_grams == null ? null : Number(row.max_weight_grams),
          minItems: row.min_items == null ? null : Number(row.min_items),
          maxItems: row.max_items == null ? null : Number(row.max_items),
          price: Number(row.price ?? 0),
          etaMinDays:
            row.eta_min_days == null ? null : Number(row.eta_min_days),
          etaMaxDays:
            row.eta_max_days == null ? null : Number(row.eta_max_days),
          sortOrder: Number(row.sort_order ?? 100),
          isActive: Boolean(row.is_active),
        };
      })
      .filter((rule): rule is NonNullable<typeof rule> => rule !== null);

    const freeShippingThreshold =
      settingsRow?.free_shipping_threshold == null
        ? null
        : Number(settingsRow.free_shipping_threshold);

    const result = calculateShipping({
      destination,
      cartLines,
      zones,
      methods,
      rules,
      selectedMethodCode,
      freeShippingThreshold,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ShippingCalculationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
