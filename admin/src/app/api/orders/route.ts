import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).maybeSingle();
  const profile = data as { is_admin: boolean } | null;
  return profile?.is_admin ? user : null;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const status = searchParams.get("status");
    let query = supabase.from("orders").select("*, order_items(*, products(title, thumbnail_images))", { count: "exact" });
    if (status) query = query.eq("status", status);
    query = query.order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [], total: count ?? 0, page, pageSize });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
