import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendOrderStatusUpdateEmail } from "@/lib/email-service";

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

    // Fetch the current order to get customer email and name
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("billing_email, billing_first_name")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the order status
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: parsed.data.status,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Send status update email to customer (non-blocking)
    sendOrderStatusUpdateEmail({
      customerEmail: currentOrder.billing_email,
      customerName: currentOrder.billing_first_name,
      orderId: id,
      status: parsed.data.status,
      trackingNumber: parsed.data.trackingNumber,
      estimatedDelivery: parsed.data.estimatedDelivery,
    }).catch((err) => {
      console.error("[Admin API] Failed to send status update email:", err);
    });

    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
