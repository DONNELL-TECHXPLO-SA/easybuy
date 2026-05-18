import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmailVerificationEmail } from "@/lib/email-service";
import { withRateLimit } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const rateCheck = withRateLimit(request, 3);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const redirectTo = `${request.nextUrl.origin}/auth/callback`;
    const { data, error } = await (supabase.auth.admin.generateLink as any)({
      type: "signup",
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      return NextResponse.json(
        { error: "Could not generate verification link." },
        { status: 400 },
      );
    }

    await sendEmailVerificationEmail(email, data.properties.action_link);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 },
    );
  }
}
