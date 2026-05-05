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

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
}

export interface OrderConfirmationParams {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
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

export interface ContactFormParams {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  params: OrderConfirmationParams,
): Promise<void> {
  try {
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

    const emailContent = `
Hi ${params.customerName},

Thank you for your order! We're excited to get your items to you.

ORDER DETAILS
Order ID: ${params.orderId}
Order Date: ${params.orderDate}

ITEMS ORDERED
${itemsList}

PRICING
Subtotal: $${params.subtotal.toFixed(2)}
Shipping (${params.shippingMethod}): $${params.shippingCost.toFixed(2)}
Total: $${params.total.toFixed(2)}

SHIPPING ADDRESS
${params.shippingAddress.firstName} ${params.shippingAddress.lastName}
${params.shippingAddress.address}
${params.shippingAddress.city}, ${params.shippingAddress.country}

Your order is being processed and will be shipped soon. You'll receive a tracking number update once your items are on their way.

If you have any questions, please don't hesitate to contact us.

Best regards,
EasyBuy Team
    `;
// Build email data with indexed items for template iteration
const emailData: Record<string, any> = {
  email: params.customerEmail,
  to_email: params.customerEmail, // Alias for compatibility
  to_name: params.customerName,
  from_name: "EasyBuy Store",
  subject: `Order Confirmation - #${params.orderId}`,
  message: emailContent,
  order_id: params.orderId,
  order_date: params.orderDate,
  items_list: itemsList,
  items_html: itemsHtml,
  items: params.items.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    price: (item.price * item.quantity).toFixed(2),
  })),
  subtotal: params.subtotal.toFixed(2),
  shipping_cost: params.shippingCost.toFixed(2),
  total: params.total.toFixed(2),
  shipping_method: params.shippingMethod,
  shipping_address: `${params.shippingAddress.firstName} ${params.shippingAddress.lastName}, ${params.shippingAddress.address}, ${params.shippingAddress.city}, ${params.shippingAddress.country}`,
  items_count: params.items.length,
};

    // Add indexed items for template (item_1_title, item_1_qty, item_1_price, etc.)
    params.items.forEach((item, index) => {
      const itemNum = index + 1;
      emailData[`item_${itemNum}_title`] = item.title;
      emailData[`item_${itemNum}_qty`] = item.quantity;
      emailData[`item_${itemNum}_price`] = (item.price * item.quantity).toFixed(
        2,
      );
    });

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_ORDER_TEMPLATE_ID!,
      emailData,
    );

    console.log(
      `[Email Service] Order confirmation sent to ${params.customerEmail}`,
    );
  } catch (error) {
    console.error("[Email Service] Failed to send order confirmation:", error);
    throw error;
  }
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

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_SHIPPED_TEMPLATE_ID!,
      {
        email: params.customerEmail,
        to_email: params.customerEmail, // Alias for compatibility
        to_name: params.customerName,
        from_name: "EasyBuy Store",
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
      },
    );

    console.log(
      `[Email Service] Status update sent to ${params.customerEmail} for order ${params.orderId}`,
    );
  } catch (error) {
    console.error("[Email Service] Failed to send status update:", error);
    throw error;
  }
}

/**
 * Send admin notification email when new order is created
 */
export async function sendAdminOrderNotification(
  params: OrderConfirmationParams,
): Promise<void> {
  try {
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

    const emailContent = `
NEW ORDER RECEIVED

Order ID: ${params.orderId}
Customer: ${params.customerName}
Customer Email: ${params.customerEmail}
Order Date: ${params.orderDate}

ITEMS
${itemsList}

TOTAL: $${params.total.toFixed(2)}

SHIPPING ADDRESS
${params.shippingAddress.firstName} ${params.shippingAddress.lastName}
${params.shippingAddress.address}
${params.shippingAddress.city}, ${params.shippingAddress.country}

Status: processing
Payment Method: bank

Please review and process this order.
    `;

    // Build email data with indexed items for template iteration
    const emailData: Record<string, any> = {
      email: process.env.ADMIN_EMAIL || "admin@easybuy.com",
      to_email: process.env.ADMIN_EMAIL || "admin@easybuy.com", // Alias for compatibility
      from_name: "EasyBuy Store",
      subject: `New Order - #${params.orderId}`,
      message: emailContent,
      order_id: params.orderId,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      items_list: itemsList,
      items_html: itemsHtml,
      items: params.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: (item.price * item.quantity).toFixed(2),
      })),
      subtotal: params.subtotal.toFixed(2),
      shipping_cost: params.shippingCost.toFixed(2),
      shipping_method: params.shippingMethod,
      total: params.total.toFixed(2),
      items_count: params.items.length,
    };

    // Add indexed items for template (item_1_title, item_1_qty, item_1_price, etc.)
    params.items.forEach((item, index) => {
      const itemNum = index + 1;
      emailData[`item_${itemNum}_title`] = item.title;
      emailData[`item_${itemNum}_qty`] = item.quantity;
      emailData[`item_${itemNum}_price`] = (item.price * item.quantity).toFixed(
        2,
      );
    });

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_ADMIN_TEMPLATE_ID!,
      emailData,
    );

    console.log(
      `[Email Service] Admin notification sent for order ${params.orderId}`,
    );
  } catch (error) {
    console.error("[Email Service] Failed to send admin notification:", error);
    throw error;
  }
}

/**
 * Send contact form email
 */
export async function sendContactFormEmail(
  params: ContactFormParams,
): Promise<void> {
  try {
    const emailContent = `
NEW CONTACT FORM SUBMISSION

Name: ${params.name}
Email: ${params.email}
${params.phone ? `Phone: ${params.phone}` : ""}
Subject: ${params.subject}

MESSAGE:
${params.message}

---
Please reply to: ${params.email}
    `;

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_CONTACT_TEMPLATE_ID!,
      {
        email: process.env.ADMIN_EMAIL || "admin@easybuy.com",
        subject: `Contact Form: ${params.subject}`,
        message: emailContent,
        from_name: params.name,
        from_email: params.email,
        from_phone: params.phone || "N/A",
      },
    );

    console.log(`[Email Service] Contact form email sent from ${params.email}`);
  } catch (error) {
    console.error("[Email Service] Failed to send contact form email:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<void> {
  try {
    const emailContent = `
Hello,

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
EasyBuy Team
    `;

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_RESET_TEMPLATE_ID!,
      {
        email: email,
        subject: "Password Reset Request",
        message: emailContent,
        reset_link: resetLink,
      },
    );

    console.log(`[Email Service] Password reset email sent to ${email}`);
  } catch (error) {
    console.error(
      "[Email Service] Failed to send password reset email:",
      error,
    );
    throw error;
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  email: string,
  verificationLink: string,
): Promise<void> {
  try {
    const emailContent = `
Welcome to EasyBuy!

Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

Best regards,
EasyBuy Team
    `;

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_VERIFY_TEMPLATE_ID!,
      {
        email: email,
        subject: "Verify Your Email Address",
        message: emailContent,
        verification_link: verificationLink,
      },
    );

    console.log(`[Email Service] Email verification sent to ${email}`);
  } catch (error) {
    console.error("[Email Service] Failed to send email verification:", error);
    throw error;
  }
}
