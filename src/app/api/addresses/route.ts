import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addressSchema = z.object({
  type: z.enum(["billing", "shipping", "both"]).optional().default("shipping"),
  first_name: z.string().max(100).optional().default(""),
  last_name: z.string().max(100).optional().default(""),
  company: z.string().max(200).optional().default(""),
  country: z.string().max(100).optional().default(""),
  street_address: z.string().max(500).optional().default(""),
  street_address_2: z.string().max(500).optional().default(""),
  city: z.string().max(100).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  is_default: z.boolean().optional().default(false),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: addresses, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }

  return NextResponse.json({ addresses: addresses ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      ...parsed.data,
    } as never)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}
