import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, full_name: fullName },
      },
    });

    if (error) {
      // Surface the exact Supabase error to the client
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Supabase returns a fake user object when email confirmation is required
    // but the user doesn't exist yet — identities array will be empty in that case.
    // When email confirmation is disabled, identities will have one entry.
    if (!data.user) {
      return NextResponse.json(
        { error: "Could not create account. Please try again." },
        { status: 400 }
      );
    }

    if (data.user.identities?.length === 0) {
      // Email confirmation is enabled — user must confirm before signing in
      return NextResponse.json(
        { error: "Please check your email to confirm your account before signing in." },
        { status: 400 }
      );
    }

    // Profile row is created automatically by the handle_new_user trigger on auth.users

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Signup error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
