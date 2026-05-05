import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendContactFormEmail } from "@/lib/email-service";

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
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { first_name, last_name, subject, phone, message, email } =
      parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        first_name,
        last_name,
        subject,
        phone,
        message,
        email,
      } as never)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[Contact API] Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send confirmation emails using EmailJS (non-blocking)
    sendContactFormEmail({
      name: `${first_name} ${last_name}`,
      email,
      phone,
      subject,
      message,
    }).catch((err) => {
      console.error("[Contact API] Failed to send emails:", err);
      // Don't fail the request if email fails - the message is already saved
    });

    return NextResponse.json(
      {
        message: "Message sent successfully. We'll get back to you shortly!",
        data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Contact API] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
