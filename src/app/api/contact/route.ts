import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendContactFormEmail } from "@/lib/email-service";
import { withRateLimit } from "@/lib/api-utils";

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  message: z.string().min(1, "Message is required"),
  email: z.string().email("Valid email required"),
});

export async function POST(request: NextRequest) {
  try {
    const rateCheck = withRateLimit(request, 5);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 },
      );
    }

    const { first_name, last_name, subject, phone, message, email } =
      parsed.data;

    const supabase = await createClient();

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        first_name,
        last_name,
        subject,
        phone,
        message,
        email,
      } as never)

    if (error) {
      console.error("[Contact API] Database error:", error);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    sendContactFormEmail({
      name: `${first_name} ${last_name}`,
      email,
      phone,
      subject,
      message,
    }).catch((err) => {
      console.error("[Contact API] Failed to send emails:", err);
    });

    return NextResponse.json(
      { message: "Message sent successfully. We'll get back to you shortly!" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
