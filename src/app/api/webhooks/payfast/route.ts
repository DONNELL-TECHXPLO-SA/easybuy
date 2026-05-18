import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/lib/email-service";
import { generatePayFastSignature } from "@/lib/payfast";

const PAYFAST_SERVER_IPS = [
  "197.189.236.42",
  "197.189.236.43",
];

function isPayFastRequest(request: NextRequest): boolean {
  if (process.env.PAYFAST_SANDBOX === "true") return true;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "";

  return PAYFAST_SERVER_IPS.includes(ip);
}

export async function POST(req: NextRequest) {
  try {
    if (!isPayFastRequest(req)) {
      return new Response("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const signature = data.signature;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    const calculatedSignature = generatePayFastSignature(data, passphrase);

    if (signature !== calculatedSignature) {
      return new Response("Invalid signature", { status: 400 });
    }

    if (data.payment_status !== "COMPLETE") {
      return new Response("OK", { status: 200 });
    }

    const orderId = data.m_payment_id;

    if (!orderId) {
      return new Response("Missing order ID", { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single() as any;

    if (orderError || !order) {
      return new Response("Order not found", { status: 404 });
    }

    if (order.status === "processing" || order.status === "delivered") {
      return new Response("OK", { status: 200 });
    }

    const updateResult = await ((supabase.from("orders") as unknown) as any)
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateResult.error) {
      return new Response("Update failed", { status: 500 });
    }

    const cartResult = await ((supabase.from("cart_items") as unknown) as any)
      .delete()
      .eq("user_id", order.user_id);

    if (cartResult.error) {
      console.error("[PayFast Webhook] Failed to clear cart:", cartResult.error);
    }

    const formattedOrderDate = new Date(order.created_at).toLocaleDateString(
      "en-ZA",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const emailParams = {
      customerEmail: order.billing_email,
      customerName: order.billing_first_name,
      orderId: order.id,
      orderDate: formattedOrderDate,
      items: order.order_items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.discounted_price,
        selectedVariations: item.selected_variations,
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shipping_cost),
      total: Number(order.total),
      shippingAddress: {
        firstName: order.shipping_first_name,
        lastName: order.shipping_last_name,
        address: order.shipping_address,
        city: order.shipping_city,
        country: order.shipping_country,
      },
      shippingMethod: order.shipping_method,
      shippingMethodLabel: order.shipping_method_label,
      shippingZoneCode: order.shipping_zone_code,
      shippingEtaMinDays: order.shipping_eta_min_days,
      shippingEtaMaxDays: order.shipping_eta_max_days,
    };

    await Promise.all([
      sendOrderConfirmationEmail(emailParams),
      sendAdminOrderNotification(emailParams),
    ]).catch(() => {});

    return new Response("OK", { status: 200 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
