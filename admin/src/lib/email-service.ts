import emailjs from "@emailjs/nodejs";

// Initialize EmailJS with the private key for server-side sending
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

export interface OrderStatusUpdateParams {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdateEmail(
  params: OrderStatusUpdateParams,
): Promise<void> {
  try {
    const statusMessages: Record<string, string> = {
      pending: "Your order has been received and is being prepared.",
      processing: "We're processing your order and preparing it for shipment.",
      "on-hold":
        "Your order is on hold. We may need some information from you.",
      shipped:
        "Your order has been shipped! You can track it using the information below.",
      delivered: "Your order has been delivered. We hope you enjoy it!",
      cancelled: "Your order has been cancelled.",
    };

    const statusMessage =
      statusMessages[params.status] ||
      `Your order status has been updated to: ${params.status}`;

    let emailContent = `
Hi ${params.customerName},

We wanted to let you know that your order status has been updated.

ORDER STATUS UPDATE
Order ID: ${params.orderId}
New Status: ${params.status.toUpperCase()}

${statusMessage}

    `;

    if (params.trackingNumber) {
      emailContent += `
TRACKING INFORMATION
Tracking Number: ${params.trackingNumber}

You can track your order using this tracking number on the carrier's website.

      `;
    }

    if (params.estimatedDelivery) {
      emailContent += `
ESTIMATED DELIVERY
Expected Delivery: ${params.estimatedDelivery}

      `;
    }

    emailContent += `
If you have any questions, please contact us.

Best regards,
EasyBuy Team
    `;

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_SHIPPED_TEMPLATE_ID!,
      {
        email: params.customerEmail,
        to_name: params.customerName,
        subject: `Order Status Update - #${params.orderId}`,
        message: emailContent,
        order_id: params.orderId,
        status: params.status,
        tracking_number: params.trackingNumber || "N/A",
        estimated_delivery: params.estimatedDelivery || "N/A",
      },
    );

    console.log(
      `[Admin Email Service] Status update sent to ${params.customerEmail} for order ${params.orderId}`,
    );
  } catch (error) {
    console.error("[Admin Email Service] Failed to send status update:", error);
    throw error;
  }
}
