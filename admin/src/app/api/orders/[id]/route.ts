import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).maybeSingle();
  const profile = data as { is_admin: boolean } | null;
  return profile?.is_admin ? user : null;
}

const orderUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "on-hold", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { data, error } = await supabase.from("orders").update({ status: parsed.data.status, updated_at: new Date().toISOString() } as never).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
