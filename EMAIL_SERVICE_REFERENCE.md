# Email Service Quick Reference

Quick guide for using EmailJS in the EasyBuy application.

## Installation

EmailJS packages are already installed:

- `@emailjs/browser` - For client-side sending
- `@emailjs/nodejs` - For server-side sending (used in this project)

## Basic Usage

### Import the Email Service

```typescript
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendAdminOrderNotification,
  sendContactFormEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from "@/lib/email-service";
```

### Send Order Confirmation Email

```typescript
await sendOrderConfirmationEmail({
  customerEmail: "customer@example.com",
  customerName: "John Doe",
  orderId: "order_12345",
  orderDate: "May 5, 2024",
  items: [
    { title: "Product 1", quantity: 2, price: 29.99 },
    { title: "Product 2", quantity: 1, price: 49.99 },
  ],
  subtotal: 109.97,
  shippingCost: 10.99,
  total: 120.96,
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "Cape Town",
    country: "South Africa",
  },
  shippingMethod: "fedex",
});
```

### Send Order Status Update Email

```typescript
await sendOrderStatusUpdateEmail({
  customerEmail: "customer@example.com",
  customerName: "John Doe",
  orderId: "order_12345",
  status: "shipped", // 'pending', 'processing', 'on-hold', 'shipped', 'delivered', 'cancelled'
  trackingNumber: "FEDEX123456789", // Optional
  estimatedDelivery: "May 10, 2024", // Optional
});
```

### Send Admin Notification

```typescript
await sendAdminOrderNotification({
  customerEmail: "customer@example.com",
  customerName: "John Doe",
  orderId: "order_12345",
  orderDate: "May 5, 2024",
  items: [{ title: "Product 1", quantity: 2, price: 29.99 }],
  subtotal: 59.98,
  shippingCost: 10.99,
  total: 70.97,
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "Cape Town",
    country: "South Africa",
  },
  shippingMethod: "free",
});
```

### Send Contact Form Email

```typescript
await sendContactFormEmail({
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "0123456789", // Optional
  subject: "Question about shipping",
  message: "Do you ship internationally?",
});
```

### Send Password Reset Email

```typescript
await sendPasswordResetEmail(
  "user@example.com",
  "https://easybuy.com/reset-password?token=abc123xyz",
);
```

### Send Email Verification Email

```typescript
await sendEmailVerificationEmail(
  "user@example.com",
  "https://easybuy.com/verify-email?token=def456xyz",
);
```

## Error Handling

Always wrap email sending in try-catch or use `.catch()`:

```typescript
// Option 1: Using async/await
try {
  await sendOrderConfirmationEmail(params);
} catch (error) {
  console.error("Failed to send email:", error);
  // Handle error - email sending failed
}

// Option 2: Using .catch() (non-blocking)
sendOrderConfirmationEmail(params).catch((err) => {
  console.error("Failed to send confirmation email:", err);
  // Log error but don't fail the operation
});
```

## Email Type Reference

| Function                     | When Used                 | Recipients                               |
| ---------------------------- | ------------------------- | ---------------------------------------- |
| `sendOrderConfirmationEmail` | After checkout            | Customer + (triggers admin notification) |
| `sendOrderStatusUpdateEmail` | Order status changed      | Customer                                 |
| `sendAdminOrderNotification` | New order created         | Admin                                    |
| `sendContactFormEmail`       | Contact form submitted    | Admin                                    |
| `sendPasswordResetEmail`     | Password reset requested  | User                                     |
| `sendEmailVerificationEmail` | Email verification needed | User                                     |

## Environment Variables Required

Add these to your `.env.local`:

```env
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_SERVICE_ID=service_xxx
EMAILJS_ORDER_TEMPLATE_ID=template_order_confirmation
EMAILJS_CONTACT_TEMPLATE_ID=template_contact_form
EMAILJS_ADMIN_TEMPLATE_ID=template_admin_notification
EMAILJS_SHIPPED_TEMPLATE_ID=template_order_shipped
EMAILJS_RESET_TEMPLATE_ID=template_password_reset
EMAILJS_VERIFY_TEMPLATE_ID=template_email_verification
ADMIN_EMAIL=admin@easybuy.com
```

## File Locations

| Service                | Location                                  |
| ---------------------- | ----------------------------------------- |
| Main Email Service     | `/src/lib/email-service.ts`               |
| Admin Email Service    | `/admin/src/lib/email-service.ts`         |
| Order API              | `/src/app/api/orders/route.ts`            |
| Contact API            | `/src/app/api/contact/route.ts`           |
| Admin Order Status API | `/admin/src/app/api/orders/[id]/route.ts` |

## Integration Points

### 1. New Order Created

- **File**: `/src/app/api/orders/route.ts` (POST)
- **Sends**: `sendOrderConfirmationEmail()` + `sendAdminOrderNotification()`

### 2. Order Status Updated

- **File**: `/admin/src/app/api/orders/[id]/route.ts` (PATCH)
- **Sends**: `sendOrderStatusUpdateEmail()`

### 3. Contact Form Submitted

- **File**: `/src/app/api/contact/route.ts` (POST)
- **Sends**: `sendContactFormEmail()`

## Testing Locally

1. Set up EmailJS account and templates
2. Add environment variables to `.env.local`
3. Start dev server: `npm run dev`
4. Test each feature:
   - Create an order
   - Update order status in admin
   - Submit contact form
5. Check console logs for success/errors

## Common Issues

### Issue: Email not sending

- ✅ Verify all environment variables are set
- ✅ Check EmailJS dashboard service is active
- ✅ Confirm template IDs match
- ✅ Check server console logs

### Issue: Template variables not rendering

- ✅ Verify variable names match exactly (case-sensitive)
- ✅ Use `{{variable_name}}` in EmailJS template
- ✅ Test template in EmailJS editor first

### Issue: Admin emails not received

- ✅ Check `ADMIN_EMAIL` environment variable
- ✅ Verify email address is correct
- ✅ Check spam folder

## Best Practices

1. **Always handle errors** - Email sending can fail
2. **Make email sending non-blocking** - Use `.catch()` after await
3. **Log email sending** - Track success/failures
4. **Test before production** - Use staging environment
5. **Monitor email limits** - Free tier has limits
6. **Validate email addresses** - Before sending
7. **Use consistent formatting** - For professional appearance

## Next Steps

- [ ] Create EmailJS account
- [ ] Set up email service
- [ ] Create templates
- [ ] Get API keys
- [ ] Update `.env.local`
- [ ] Test email sending
- [ ] Deploy to production

See [EMAILJS_SETUP.md](./EMAILJS_SETUP.md) for detailed setup instructions.
