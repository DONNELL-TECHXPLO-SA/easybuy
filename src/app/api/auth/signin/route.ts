import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
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
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Re-build the response now that we have the user, reusing the same
    // response object so cookies set above are preserved.
    const successResponse = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

    // Copy cookies from the interim response to the final one
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      successResponse.cookies.set(name, value, options);
    });

    return successResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Signin error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
