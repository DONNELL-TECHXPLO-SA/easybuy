import emailjs from "@emailjs/nodejs";

// Initialize EmailJS with the private key for server-side sending
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

export interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderStatusUpdateParams {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: string;
  items: OrderItem[];
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

    const itemsList = params.items
      .map(
        (item) =>
          `• ${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n");

    const itemsHtml = params.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <span style="font-weight: 500; color: #1c274c;">${item.title}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    let emailContent = `
Hi ${params.customerName},

We wanted to let you know that your order status has been updated.

ORDER STATUS UPDATE
Order ID: ${params.orderId}
New Status: ${params.status.toUpperCase()}

${statusMessage}

ITEMS IN THIS ORDER
${itemsList}

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

    console.log(
      `[Admin Email Service] Sending status update to ${params.customerEmail} for order ${params.orderId}...`,
    );

    const emailParams = {
      email: params.customerEmail,
      to_email: params.customerEmail, // Alias for compatibility
      to_name: params.customerName,
      from_name: "EasyBuy Store",
      reply_to: process.env.ADMIN_EMAIL || "eugene@techxplo.co.za",
      subject: `Order Status Update - #${params.orderId}`,
      message: emailContent,
      order_id: params.orderId,
      status: params.status,
      items_list: itemsList,
      items_html: itemsHtml,
      items: params.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: (item.price * item.quantity).toFixed(2),
      })),
      tracking_number: params.trackingNumber || "N/A",
      estimated_delivery: params.estimatedDelivery || "N/A",
      shipped: params.status === "shipped",
    };

    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_SHIPPED_TEMPLATE_ID
    ) {
      throw new Error("Missing EmailJS Service ID or Template ID");
    }

    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_SHIPPED_TEMPLATE_ID,
      emailParams,
    );

    console.log(
      `[Admin Email Service] Status update sent successfully! Result:`,
      result,
    );
  } catch (error: any) {
    console.error("[Admin Email Service] Failed to send status update:", error);
    // Log more detail if it's an EmailJS error
    if (error?.text)
      console.error("[Admin Email Service] EmailJS error text:", error.text);
    throw error;
  }
}
