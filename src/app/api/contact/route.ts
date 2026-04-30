import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  message: z.string().min(1, "Message is required"),
});

async function sendConfirmationEmail(data: {
  first_name: string;
  last_name: string;
  subject: string;
  message: string;
  email?: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(
      "[contact] SMTP not configured — skipping confirmation email for:",
      data.first_name,
      data.last_name
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: parseInt(SMTP_PORT || "587", 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const fromAddress = SMTP_FROM || SMTP_USER;
  const toAddress = data.email || SMTP_USER;

  await transporter.sendMail({
    from: `"NextCommerce" <${fromAddress}>`,
    to: toAddress,
    subject: "We received your message",
    html: `
      <p>Hi ${data.first_name},</p>
      <p>Thank you for reaching out. We have received your message and will get back to you shortly.</p>
      <hr />
      <p><strong>Subject:</strong> ${data.subject || "(none)"}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, "<br />")}</p>
      <hr />
      <p>The NextCommerce Team</p>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { first_name, last_name, subject, phone, message } = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({ first_name, last_name, subject, phone, message } as never)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await sendConfirmationEmail({ first_name, last_name, subject, message });

    return NextResponse.json({ message: "Message sent successfully", data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
