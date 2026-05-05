# EmailJS Integration Guide

This project uses **EmailJS** to send emails for order confirmations, status updates, contact forms, and more. This guide explains how to set up and use the email service.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Email Templates](#email-templates)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Setup Instructions

### 1. Create an EmailJS Account

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Create New Service**
3. Choose a service provider (Gmail, Outlook, Custom SMTP, etc.)
4. Follow the setup instructions for your chosen provider
5. Copy your **Service ID** (e.g., `service_xxxxxxxxx`)

### 3. Create Email Templates

You need to create the following templates in EmailJS. Each template should use the provided template variables.

#### Template 1: Order Confirmation

- **Template Name**: Order Confirmation
- **Template ID**: `template_order_confirmation`
- **Recipients**: `{{to_email}}`
- **Subject**: `{{subject}}`

Template Variables:

```
to_email - Customer's email address
to_name - Customer's name
subject - Email subject
message - Full email content
order_id - Order ID
order_date - Order date
items_list - List of items ordered
subtotal - Order subtotal
shipping_cost - Shipping cost
total - Order total
shipping_method - Shipping method (free, fedex, dhl)
shipping_address - Full shipping address
```

#### Template 2: Order Status Update

- **Template Name**: Order Status Update
- **Template ID**: `template_order_shipped`
- **Recipients**: `{{to_email}}`
- **Subject**: `{{subject}}`

Template Variables:

```
to_email - Customer's email address
to_name - Customer's name
subject - Email subject
message - Full email content
order_id - Order ID
status - New order status (pending, processing, on-hold, shipped, delivered, cancelled)
tracking_number - Tracking number (if applicable)
estimated_delivery - Estimated delivery date (if applicable)
```

#### Template 3: Contact Form

- **Template Name**: Contact Form
- **Template ID**: `template_contact_form`
- **Recipients**: `{{to_email}}`
- **Subject**: `{{subject}}`

Template Variables:

```
to_email - Admin email
subject - Email subject
message - Full email content
from_name - Contact form submitter's name
from_email - Submitter's email
from_phone - Submitter's phone (optional)
```

#### Template 4: Admin Notification

- **Template Name**: Admin Order Notification
- **Template ID**: `template_admin_notification`
- **Recipients**: `{{to_email}}`
- **Subject**: `{{subject}}`

Template Variables:

```
to_email - Admin email
subject - Email subject
message - Full email content
order_id - New order ID
customer_name - Customer name
customer_email - Customer email
total - Order total
```

#### Template 5: Password Reset

- **Template Name**: Password Reset
- **Template ID**: `template_password_reset`
- **Recipients**: `{{to_email}}`
- **Subject**: `{{subject}}`

Template Variables:

```
to_email - User's email
subject - Email subject
message - Full email content
reset_link - Password reset link
```

#### Template 6: Email Verification

- **Template Name**: Email Verification
- **Template ID**: `template_email_verification`
- **Recipients**: `{{to_email}}`
- **Subject**: `{{subject}}`

Template Variables:

```
to_email - User's email
subject - Email subject
message - Full email content
verification_link - Email verification link
```

### 4. Get Your API Keys

1. In the EmailJS dashboard, go to **Account**
2. Copy your:
   - **Public Key** (starts with `your_emailjs_public_key`)
   - **Private Key** (for server-side sending)

### 5. Update Environment Variables

#### Main App (`/`)

Update `/​.env.local` (or create it):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# EmailJS Configuration
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
EMAILJS_SERVICE_ID=service_your_service_id

# Template IDs
EMAILJS_ORDER_TEMPLATE_ID=template_order_confirmation
EMAILJS_CONTACT_TEMPLATE_ID=template_contact_form
EMAILJS_ADMIN_TEMPLATE_ID=template_admin_notification
EMAILJS_SHIPPED_TEMPLATE_ID=template_order_shipped
EMAILJS_RESET_TEMPLATE_ID=template_password_reset
EMAILJS_VERIFY_TEMPLATE_ID=template_email_verification

# Admin Settings
ADMIN_EMAIL=admin@easybuy.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Admin App (`/admin`)

Update `/admin/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# EmailJS Configuration
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
EMAILJS_SERVICE_ID=service_your_service_id

# Template IDs
EMAILJS_SHIPPED_TEMPLATE_ID=template_order_shipped

# Admin Settings
ADMIN_EMAIL=admin@easybuy.com
```

## Email Templates

### Features Implemented

#### 1. **Order Confirmation Email**

- Sent automatically when a customer completes a checkout
- Includes order details, items, pricing, and shipping address
- Also triggers admin notification

**Location**: `/src/app/api/orders/route.ts`

```typescript
sendOrderConfirmationEmail({
  customerEmail: billing.email,
  customerName: billing.firstName,
  orderId: order.id,
  orderDate: formattedOrderDate,
  items: orderItems,
  subtotal,
  shippingCost,
  total,
  shippingAddress,
  shippingMethod,
});
```

#### 2. **Order Status Update Email**

- Sent when admin updates order status
- Supports tracking numbers and estimated delivery dates
- Status types: pending, processing, on-hold, shipped, delivered, cancelled

**Location**: `/admin/src/app/api/orders/[id]/route.ts`

```typescript
sendOrderStatusUpdateEmail({
  customerEmail: email,
  customerName: name,
  orderId: orderId,
  status: "shipped",
  trackingNumber: "TRACK123456",
  estimatedDelivery: "2024-05-10",
});
```

#### 3. **Contact Form Email**

- Sent when a customer submits the contact form
- Notifies admin of new message

**Location**: `/src/app/api/contact/route.ts`

#### 4. **Admin Notifications**

- Sent to admin when new order is created
- Contains order summary and customer details

#### 5. **Password Reset Email**

- Ready for authentication implementation
- Use when password reset is requested

**Usage**:

```typescript
import { sendPasswordResetEmail } from "@/lib/email-service";

await sendPasswordResetEmail(
  "user@example.com",
  "https://yourapp.com/reset-password?token=abc123",
);
```

#### 6. **Email Verification**

- Ready for authentication implementation
- Use when account verification is needed

**Usage**:

```typescript
import { sendEmailVerificationEmail } from "@/lib/email-service";

await sendEmailVerificationEmail(
  "user@example.com",
  "https://yourapp.com/verify-email?token=abc123",
);
```

## API Endpoints

### Main App

#### POST `/api/orders`

Creates a new order and sends confirmation emails.

**Request**:

```json
{
  "billing": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "country": "South Africa",
    "address": "123 Main St",
    "city": "Cape Town",
    "phone": "0123456789"
  },
  "shipping": { ... },
  "shippingMethod": "free",
  "notes": "Please handle with care",
  "cartItems": [...]
}
```

**Response**:

```json
{
  "order": {
    "id": "order_123",
    "status": "processing",
    "total": 299.99,
    ...
  }
}
```

#### POST `/api/contact`

Submits a contact form message.

**Request**:

```json
{
  "first_name": "Jane",
  "email": "jane@example.com",
  "subject": "Question about shipping",
  "message": "Do you ship internationally?",
  "phone": "0123456789"
}
```

### Admin App

#### PATCH `/api/orders/[id]`

Updates order status and sends status update email to customer.

**Request**:

```json
{
  "status": "shipped",
  "trackingNumber": "FEDEX123456",
  "estimatedDelivery": "2024-05-10"
}
```

**Response**:

```json
{
  "order": {
    "id": "order_123",
    "status": "shipped",
    "updated_at": "2024-05-05T10:30:00Z",
    ...
  }
}
```

## Testing

### Test the Email Service Locally

1. **Update your `.env.local` files** with your EmailJS credentials
2. **Start the development servers**:

   ```bash
   # Main app
   npm run dev

   # Admin app (in another terminal)
   cd admin && npm run dev
   ```

3. **Test Order Confirmation**:
   - Navigate to the checkout page
   - Complete a test order
   - Check your email for the confirmation

4. **Test Status Updates** (Admin):
   - Go to the admin panel
   - Find a test order
   - Update its status to "shipped"
   - Check your email for the status update

5. **Test Contact Form**:
   - Fill out the contact form on the site
   - Submit it
   - Check your admin email for the message

### Email Testing Tools

- **Mailtrap**: Use for testing without sending real emails
  1. Sign up at [mailtrap.io](https://mailtrap.io)
  2. Get your SMTP credentials
  3. Create a custom SMTP service in EmailJS
  4. Use the Mailtrap credentials

- **Gmail Testing**:
  1. Create a test Gmail account
  2. Enable "Less secure app access"
  3. Use Gmail as your EmailJS service

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**:

   ```bash
   # Verify they're set correctly
   echo $EMAILJS_PUBLIC_KEY
   echo $EMAILJS_PRIVATE_KEY
   echo $EMAILJS_SERVICE_ID
   ```

2. **Check Console Logs**:
   - Look for error messages in server logs
   - Check browser console for client-side errors

3. **Verify EmailJS Setup**:
   - Confirm Service ID is correct
   - Verify all template IDs match your EmailJS templates
   - Check email service provider credentials

4. **Test EmailJS Directly**:
   ```bash
   # Use EmailJS test endpoint
   curl -X POST https://api.emailjs.com/api/v1.0/email/send \
     -H "Content-Type: application/json" \
     -d '{
       "service_id": "your_service_id",
       "template_id": "your_template_id",
       "user_id": "your_public_key",
       "template_params": {...}
     }'
   ```

### Template Variables Not Rendering

- Ensure template variable names match exactly (case-sensitive)
- Use `{{variable_name}}` syntax in templates
- Test variables in EmailJS template editor first

### Rate Limiting

- EmailJS has rate limits on free tier
- Check [EmailJS Pricing](https://www.emailjs.com/pricing) for limits
- Consider upgrading if you exceed limits

### Emails Going to Spam

1. **Add SPF Record** to your email service provider
2. **Add DKIM** signature in email service settings
3. **Use consistent sender email**
4. **Test with Mailtrap** before production

## Production Deployment

### Before Going Live

1. ✅ Update environment variables on hosting platform
2. ✅ Verify all template IDs in EmailJS
3. ✅ Test email sending in staging environment
4. ✅ Configure SPF and DKIM records
5. ✅ Set admin email correctly
6. ✅ Test all email types (confirmation, status, contact)

### Vercel Deployment

1. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all `EMAILJS_*` variables
   - Add `ADMIN_EMAIL` and `NEXT_PUBLIC_APP_URL`

2. **Redeploy** both main app and admin app

### Environment Variables Checklist

```
☐ EMAILJS_PUBLIC_KEY
☐ EMAILJS_PRIVATE_KEY
☐ EMAILJS_SERVICE_ID
☐ EMAILJS_ORDER_TEMPLATE_ID
☐ EMAILJS_CONTACT_TEMPLATE_ID
☐ EMAILJS_ADMIN_TEMPLATE_ID
☐ EMAILJS_SHIPPED_TEMPLATE_ID
☐ EMAILJS_RESET_TEMPLATE_ID
☐ EMAILJS_VERIFY_TEMPLATE_ID
☐ ADMIN_EMAIL
☐ NEXT_PUBLIC_APP_URL (for main app)
```

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS API Reference](https://www.emailjs.com/docs/rest-api/send/)
- [Email Template Best Practices](https://www.emailjs.com/docs/user-guide/email-templates/)

## Support

For issues or questions:

1. Check the [EmailJS Support](https://www.emailjs.com/support/)
2. Review error logs in your application
3. Test with Mailtrap to isolate issues
4. Check EmailJS dashboard for service status
