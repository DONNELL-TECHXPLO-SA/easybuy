import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { withRateLimit } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const rateCheck = withRateLimit(request, 10);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = (() => {
        const text = error.message ?? "";
        if (
          /email.*(not confirmed|not verified|verify|confirmation)/i.test(text)
        ) {
          return "Please verify your email before signing in. Check your inbox for the verification link.";
        }
        return text || "Invalid email or password";
      })();

      return NextResponse.json(
        { error: message },
        { status: error.status ?? 400 },
      );
    }

    const successResponse = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      successResponse.cookies.set(name, value, options);
    });

    return successResponse;
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
