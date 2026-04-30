import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/setup
 * Creates or updates an admin user with given credentials
 * Body: { email: string, password: string, firstName?: string, lastName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      firstName = "",
      lastName = "",
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const adminClient = createAdminClient();

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === email);

    let userId: string;

    if (existingUser) {
      // Update password for existing user
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        password,
      });
      userId = existingUser.id;
      console.log(`Updated password for existing user: ${email}`);
    } else {
      // Create new user
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        return NextResponse.json(
          { error: `Failed to create user: ${error.message}` },
          { status: 400 },
        );
      }

      userId = data.user.id;
      console.log(`Created new user: ${email}`);
    }

    // Ensure user_profiles entry exists with is_admin = true
    const { error: profileError } = await adminClient
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          is_admin: true,
        },
        { onConflict: "id" },
      );

    if (profileError) {
      return NextResponse.json(
        { error: `Failed to set admin status: ${profileError.message}` },
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
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/setup
 * Returns status of auth setup (for testing)
 */
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data: users } = await adminClient.auth.admin.listUsers();

    const adminUsers =
      users?.users
        .filter((u) => u.email_confirmed_at)
        .map((u) => ({
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
        })) || [];

    return NextResponse.json({
      message: "Auth setup endpoint ready",
      totalUsers: users?.users.length || 0,
      confirmedUsers: adminUsers.length,
      users: adminUsers,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
