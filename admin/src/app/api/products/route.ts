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

const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().min(0),
  discounted_price: z.number().min(0),
  reviews: z.number().int().min(0).default(0),
  category_id: z.number().int().nullable().default(null),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  thumbnail_images: z.array(z.string()).default([]),
  preview_images: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const search = searchParams.get("search") ?? "";
    let query = supabase.from("products").select("*", { count: "exact" });
    if (search) query = query.ilike("title", `%${search}%`);
    query = query.order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return NextResponse.json({ products: data ?? [], total: count ?? 0, page, pageSize });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { data, error } = await supabase.from("products").insert(parsed.data as never).select().maybeSingle();
    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
