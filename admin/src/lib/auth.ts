import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DbUserProfile } from "@/types/database";

export interface AdminAuthResult {
  userId: string;
  profile: DbUserProfile;
}

export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as DbUserProfile | null;

  if (!profile || !profile.is_admin) {
    redirect("/signin");
  }

  return { userId: user.id, profile };
}
