import { z } from "zod";

export const checkoutSchema = z.object({
  billing: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional().default(""),
    country: z.string().min(1, "Country is required"),
    region: z.string().optional().default(""),
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional().default(""),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Invalid email address"),
  }),
  shipping: z
    .object({
      firstName: z.string().optional().default(""),
      lastName: z.string().optional().default(""),
      country: z.string().optional().default(""),
      region: z.string().optional().default(""),
      address: z.string().optional().default(""),
      address2: z.string().optional().default(""),
      city: z.string().optional().default(""),
      postalCode: z.string().optional().default(""),
    })
    .optional(),
  shippingMethod: z
    .string()
    .min(1, "Shipping method is required")
    .default("free"),
  notes: z.string().optional().default(""),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
