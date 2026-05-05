import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendOrderStatusUpdateEmail } from "@/lib/email-service";
import type { Database } from "@/types/database";

type OrderEmailFields = {
  billing_email: string;
  billing_first_name: string;
  order_items: Array<{
    title: string;
    quantity: number;
    discounted_price: number;
  }>;
};

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as { is_admin: boolean } | null;
  return profile?.is_admin ? user : null;
}

const orderUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "on-hold",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);

    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );

    // Fetch the current order to get customer email, name, and items
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select(`
        billing_email, 
        billing_first_name,
        order_items (
          title,
          quantity,
          discounted_price
        )
      `)
      .eq("id", id)
      .maybeSingle();

    const orderForEmail = currentOrder as unknown as OrderEmailFields | null;

    if (fetchError || !orderForEmail) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the order status and tracking info
    const updatePayload: any = {
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.trackingNumber) {
      updatePayload.tracking_number = parsed.data.trackingNumber;
    }
    if (parsed.data.estimatedDelivery) {
      updatePayload.estimated_delivery = parsed.data.estimatedDelivery;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Send status update email to customer (non-blocking)
    sendOrderStatusUpdateEmail({
      customerEmail: orderForEmail.billing_email,
      customerName: orderForEmail.billing_first_name,
      orderId: id,
      status: parsed.data.status,
      items: orderForEmail.order_items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.discounted_price,
      })),
      trackingNumber: parsed.data.trackingNumber,
      estimatedDelivery: parsed.data.estimatedDelivery,
    }).catch((err) => {
      console.error("[Admin API] Failed to send status update email:", err);
    });

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("[Admin API] Order update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
