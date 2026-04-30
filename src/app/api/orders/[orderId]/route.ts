import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

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
        notes,
        billing_first_name,
        billing_last_name,
        billing_company,
        billing_country,
        billing_address,
        billing_address_2,
        billing_city,
        billing_phone,
        billing_email,
        shipping_first_name,
        shipping_last_name,
        shipping_address,
        shipping_address_2,
        shipping_city,
        shipping_country,
        created_at,
        order_items (
          id,
          product_id,
          title,
          price,
          discounted_price,
          quantity,
          thumbnail_image
        )
      `
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
