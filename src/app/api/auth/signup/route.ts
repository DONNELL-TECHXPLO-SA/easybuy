import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmailVerificationEmail } from "@/lib/email-service";
import { withRateLimit } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const rateCheck = withRateLimit(request, 5);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must be less than 128 characters" },
        { status: 400 },
      );
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";

    const supabase = createAdminClient();

    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
      },
    });

    if (createError) {
      const text = createError.message ?? "Could not create account. Please try again.";
      const message = /already exists|duplicate/i.test(text)
        ? "An account with this email already exists"
        : text;
      const status = /already exists|duplicate/i.test(text)
        ? 409
        : createError.status ?? 400;

      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    const userId = createData?.user?.id;
    const redirectTo = `${request.nextUrl.origin}/auth/callback`;
    let verificationSent = false;

    try {
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "signup",
          email,
          options: { redirectTo },
        });

      if (linkError) {
        throw linkError;
      }

      if (linkData?.properties?.action_link) {
        await sendEmailVerificationEmail(email, linkData.properties.action_link);
        verificationSent = true;
      }
    } catch (linkError) {
      if (userId) {
        await supabase.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });
      }
    }

    return NextResponse.json(
      { success: true, verificationSent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
