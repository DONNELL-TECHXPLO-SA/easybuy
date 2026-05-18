import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOW_ADMIN_SETUP = process.env.ALLOW_ADMIN_SETUP === "true";
const ADMIN_SETUP_SECRET_KEY = process.env.ADMIN_SETUP_SECRET_KEY;

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now >= entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  entry.count += 1;
  if (entry.count > 5) return false;

  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

function isSetupAllowed(secretKey?: string) {
  return (
    ALLOW_ADMIN_SETUP &&
    Boolean(ADMIN_SETUP_SECRET_KEY) &&
    secretKey === ADMIN_SETUP_SECRET_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(getClientIp(request))) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
    }

    if (!ALLOW_ADMIN_SETUP || !ADMIN_SETUP_SECRET_KEY) {
      return NextResponse.json(
        { error: "Admin setup is disabled" },
        { status: 403 },
      );
    }

    const {
      email,
      password,
      firstName = "",
      lastName = "",
      secretKey,
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (!isSetupAllowed(secretKey)) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = (existingUsers?.users ?? []).find(
      (u: { id: string; email?: string | null }) => u.email === email,
    );

    let userId: string;

    if (existingUser) {
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        password,
      });
      userId = existingUser.id;
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        return NextResponse.json(
          { error: "Failed to create user. Check credentials." },
          { status: 400 },
        );
      }

      userId = data.user.id;
    }

    const { error: profileError } = await adminClient
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          is_admin: true,
        } as any,
        { onConflict: "id" },
      );

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to set admin status" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Admin user setup successful",
        email,
        userId,
        isAdmin: true,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    if (!ALLOW_ADMIN_SETUP || !ADMIN_SETUP_SECRET_KEY) {
      return NextResponse.json(
        { error: "Admin setup is disabled" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      message: "Admin setup endpoint is available (POST to create admin user)",
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
