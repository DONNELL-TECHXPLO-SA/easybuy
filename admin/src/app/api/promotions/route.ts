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

const promotionSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().default(""),
  discount_label: z.string().default(""),
  description: z.string().default(""),
  image_url: z.string().default(""),
  button_text: z.string().default("Shop Now"),
  button_link: z.string().default("/"),
  is_active: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase.from("promotions").select("*").order("sort_order");
    if (error) throw error;
    return NextResponse.json({ promotions: data ?? [] });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { data, error } = await supabase.from("promotions").insert(parsed.data as never).select().maybeSingle();
    if (error) throw error;
    return NextResponse.json({ promotion: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
