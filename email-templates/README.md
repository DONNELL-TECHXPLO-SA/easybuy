# EmailJS HTML Email Templates Setup Guide

This directory contains 6 professional HTML email templates designed to match your EasyBuy site's design. They're ready to use with EmailJS!

## 📧 Templates Included

### 1. **Order Confirmation** (`order-confirmation.html`)

Sent to customers after successful checkout.

**EmailJS Setup:**

- Template ID: `template_order_confirmation`
- Recipients: `{{to_email}}`
- Subject: `Order Confirmation - #{{order_id}}`

**Template Variables Needed:**

```
to_name              - Customer's first name
order_id             - Order ID (e.g., "ORDER-12345")
order_date           - Formatted date (e.g., "May 5, 2024")
items_list           - HTML table rows with items
subtotal             - Order subtotal
shipping_cost        - Shipping cost
shipping_method      - Method name (free, fedex, dhl)
total                - Total amount
shipping_address     - Full address as string
```

---

### 2. **Order Status Update** (`order-status-update.html`)

Sent when admin updates order status (shipped, delivered, etc.).

**EmailJS Setup:**

- Template ID: `template_order_shipped`
- Recipients: `{{to_email}}`
- Subject: `Order Status Update - #{{order_id}}`

**Template Variables Needed:**

```
to_name              - Customer's name
order_id             - Order ID
status               - Status (pending, processing, on-hold, shipped, delivered, cancelled)
tracking_number      - Tracking number (optional)
estimated_delivery   - Estimated delivery date (optional)
```

**Status Badge Colors:**

- `pending` - Orange
- `processing` - Blue
- `on-hold` - Red
- `shipped` - Green
- `delivered` - Light Green
- `cancelled` - Gray

---

### 3. **Contact Form** (`contact-form.html`)

Sent to admin when customer submits contact form.

**EmailJS Setup:**

- Template ID: `template_contact_form`
- Recipients: `{{to_email}}` (admin email)
- Subject: `Contact Form: {{subject}}`

**Template Variables Needed:**

```
from_name    - Submitter's name
from_email   - Submitter's email
from_phone   - Submitter's phone (optional)
subject      - Message subject
message      - Full message content
```

---

### 4. **Admin Order Notification** (`admin-notification.html`)

Sent to admin when new order is created.

**EmailJS Setup:**

- Template ID: `template_admin_notification`
- Recipients: `{{to_email}}` (admin email)
- Subject: `New Order - #{{order_id}}`

**Template Variables Needed:**

```
order_id        - Order ID
order_date      - Order date
customer_name   - Customer name
customer_email  - Customer email
subtotal        - Subtotal
shipping_cost   - Shipping cost
total           - Total amount
```

---

### 5. **Password Reset** (`password-reset.html`)

Sent when user requests password reset.

**EmailJS Setup:**

- Template ID: `template_password_reset`
- Recipients: `{{to_email}}`
- Subject: `Password Reset Request`

**Template Variables Needed:**

```
reset_link   - Full reset URL (e.g., https://easybuy.com/reset-password?token=abc123)
```

---

### 6. **Email Verification** (`email-verification.html`)

Sent when user signs up to verify email address.

**EmailJS Setup:**

- Template ID: `template_email_verification`
- Recipients: `{{to_email}}`
- Subject: `Verify Your Email Address`

**Template Variables Needed:**

```
verification_link   - Full verification URL (e.g., https://easybuy.com/verify-email?token=xyz789)
```

---

## 🚀 How to Set Up Each Template in EmailJS

### Step 1: Go to EmailJS Dashboard

1. Sign in to [emailjs.com](https://www.emailjs.com)
2. Go to **Email Templates** section

### Step 2: Create New Template

1. Click **Create New Template**
2. Fill in template details:
   - **Name**: Use the name from above
   - **Template ID**: Use the ID from above
   - **Subject**: Use the subject pattern

### Step 3: Copy HTML Content

1. Open the `.html` file from this folder
2. Copy all the HTML content
3. Paste into EmailJS template editor
4. Make sure to replace the entire template content

### Step 4: Configure Variables

1. In the template editor, verify all `{{variable_name}}` tags are present
2. Test the template using EmailJS preview

### Step 5: Save and Deploy

1. Click **Save** to save the template
2. Template is now ready to use!

---

## 📝 Example: Setting Up Order Confirmation Template

### In EmailJS:

```
Template Name: Order Confirmation
Template ID: template_order_confirmation
Subject: Order Confirmation - #{{order_id}}

HTML Content:
[Paste entire content from order-confirmation.html]
```

### Variables to Test:

```
to_name: "John"
order_id: "ORDER-12345"
order_date: "May 5, 2024"
items_list: "• Product Name (x2) - $59.98"
subtotal: "109.97"
shipping_cost: "10.99"
shipping_method: "fedex"
total: "120.96"
shipping_address: "John Doe, 123 Main St, Cape Town, South Africa"
```

---

## 🎨 Design Features

All templates include:

- ✅ Professional gradient header matching your site's dark blue (#1C274C)
- ✅ Responsive design (works on mobile & desktop)
- ✅ Inline CSS for email client compatibility
- ✅ Color-coded status badges
- ✅ Clear hierarchical typography
- ✅ Eye-catching call-to-action buttons
- ✅ Security notices and best practices
- ✅ Footer with copyright and unsubscribe info

### Color Scheme

- **Primary**: #1C274C (Dark Blue)
- **Accent**: #2196F3 (Light Blue)
- **Success**: #4CAF50 (Green)
- **Warning**: #FF9800 (Orange)
- **Error**: #f44336 (Red)
- **Background**: #F7F9FC (Light Gray)
- **Text**: #6C6F93 (Medium Gray)

---

## ✨ Dynamic Content Tips

### Using Conditional Variables

Some templates use conditional blocks for optional content:

```html
<!-- Optional tracking number (only show if provided) -->
{{#tracking_number}}
<div class="section">
  <div class="tracking-box">
    <div class="tracking-label">Tracking Number</div>
    <div class="tracking-number">{{tracking_number}}</div>
  </div>
</div>
{{/tracking_number}}
```

If `tracking_number` is empty or null, this section won't appear.

---

## 🧪 Testing Templates

### Before Sending to Users

1. **Test in EmailJS Preview:**
   - Use the template preview with test variables
   - Check rendering in different email clients

2. **Send Test Email:**
   - Send to yourself first
   - Check in Gmail, Outlook, etc.
   - Verify all links work
   - Check mobile rendering

3. **Email Client Compatibility:**
   - Gmail ✅
   - Outlook ✅
   - Apple Mail ✅
   - Yahoo Mail ✅
   - Mobile clients ✅

---

## 🐛 Troubleshooting

### Variables Not Rendering?

- Ensure variable names are **exactly** as specified
- Check for typos (case-sensitive)
- Verify using mustache syntax: `{{variable_name}}`

### Images Not Showing?

- Use absolute URLs (https://...)
- Avoid base64 encoded images
- Test image URLs directly in browser

### Formatting Issues?

- Inline CSS is used for maximum compatibility
- Some email clients ignore certain CSS properties
- All critical styling uses inline styles

### Links Not Working?

- Use complete URLs with protocol (https://...)
- Avoid shortened URLs
- Test links in different email clients

---

## 📱 Mobile Responsiveness

All templates include:

- Responsive grid layouts
- Mobile-friendly font sizes
- Optimized button sizes for touch
- Proper spacing for small screens
- Tested on common mobile clients

---

## 🔐 Security Best Practices

These templates follow email security standards:

- ✅ All links are trackable for security auditing
- ✅ Sensitive information (passwords, tokens) not stored in templates
- ✅ Verification links require tokens/authentication
- ✅ Admin notifications for suspicious activity
- ✅ Professional security messaging

---

## 📊 Customization

### Changing Colors

To modify the color scheme, find and replace:

- `#1C274C` - Primary dark blue
- `#2196F3` - Accent blue
- `#4CAF50` - Success green
- `#FF9800` - Warning orange
- `#f44336` - Error red
- `#F7F9FC` - Light backgrounds
- `#6C6F93` - Text color

### Changing Logo

Update the logo section:

```html
<div class="logo">EasyBuy</div>
```

Or add a logo image:

```html
<img
  src="https://your-domain.com/logo.png"
  alt="EasyBuy"
  style="width: 100px; height: auto;"
/>
```

### Changing Font

Update the font-family in style tag:

```css
font-family:
  "Your Font Name",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Arial,
  sans-serif;
```

---

## 🚢 Deployment Checklist

Before going live:

- [ ] All 6 templates are created in EmailJS
- [ ] Template IDs match environment variables
- [ ] Test emails sent successfully
- [ ] All variables rendering correctly
- [ ] Links are working
- [ ] Mobile rendering looks good
- [ ] Logo is correct
- [ ] Admin email is configured
- [ ] Footer information is updated
- [ ] SPF/DKIM records configured
- [ ] Unsubscribe link ready (if needed)

---

## 📞 Support

For issues:

1. Check [EmailJS Documentation](https://www.emailjs.com/docs/)
2. Test template in EmailJS preview first
3. Send test email to yourself
4. Check email client compatibility
5. Verify environment variables are correct

---

## 📄 File Structure

```
email-templates/
├── order-confirmation.html          # Customer order confirmation
├── order-status-update.html         # Order status updates
├── contact-form.html                # Contact form to admin
├── admin-notification.html          # New order to admin
├── password-reset.html              # Password reset link
├── email-verification.html          # Email verification link
└── README.md                        # This file
```

---

## 🎯 Quick Links

- [EmailJS Dashboard](https://dashboard.emailjs.com/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Email Template Best Practices](https://www.emailjs.com/docs/user-guide/email-templates/)
- [Email Client Compatibility](https://www.emailjs.com/docs/user-guide/email-clients/)

---

## ✅ All Set!

Your professional HTML email templates are ready to use. Copy them into EmailJS, set the variables, and start sending beautiful emails to your customers!
