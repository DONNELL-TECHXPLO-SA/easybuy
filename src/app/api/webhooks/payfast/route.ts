import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/lib/email-service";
import { generatePayFastSignature } from "@/lib/payfast";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("[PayFast Webhook] Received ITN:", data);

    const signature = data.signature;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    // 1. Verify Signature
    const calculatedSignature = generatePayFastSignature(data, passphrase);

    if (signature !== calculatedSignature) {
      console.error("[PayFast Webhook] Signature mismatch", {
        received: signature,
        calculated: calculatedSignature,
      });
      return new Response("Invalid signature", { status: 400 });
    }

    // 2. Verify Payment Status
    if (data.payment_status !== "COMPLETE") {
      console.log(
        `[PayFast Webhook] Payment not complete: ${data.payment_status}`
      );
      return new Response("OK", { status: 200 });
    }

    const orderId = data.m_payment_id;

    if (!orderId) {
      console.error("[PayFast Webhook] Missing m_payment_id");
      return new Response("Missing order ID", { status: 400 });
    }

    const supabase = createAdminClient();

    // 3. Fetch order and items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single() as any;

    if (orderError || !order) {
      console.error("[PayFast Webhook] Order not found:", orderId);
      return new Response("Order not found", { status: 404 });
    }

    // 4. Only process if not already processed
    if (order.status === "processing") {
      console.log("[PayFast Webhook] Order already processed:", orderId);
      return new Response("OK", { status: 200 });
    }

    // 5. Update order status
    const updateResult = await ((supabase.from("orders") as unknown) as any)
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateResult.error) {
      console.error("[PayFast Webhook] Failed to update order:", updateResult.error);
      return new Response("Update failed", { status: 500 });
    }

    // 6. Clear cart for user
    const cartResult = await ((supabase.from("cart_items") as unknown) as any)
      .delete()
      .eq("user_id", order.user_id);

    if (cartResult.error) {
      console.error("[PayFast Webhook] Failed to clear cart:", cartResult.error);
    }

    // 7. Send emails
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
    ]).catch((err) => {
      console.error("[PayFast Webhook] Failed to send emails:", err);
    });

    console.log("[PayFast Webhook] Order processed successfully:", orderId);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[PayFast Webhook] Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
