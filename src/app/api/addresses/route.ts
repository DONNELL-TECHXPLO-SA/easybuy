import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  const {
    type,
    first_name,
    last_name,
    company,
    country,
    street_address,
    street_address_2,
    city,
    phone,
    email,
    is_default,
  } = body;

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      type: type ?? "shipping",
      first_name: first_name ?? "",
      last_name: last_name ?? "",
      company: company ?? "",
      country: country ?? "",
      street_address: street_address ?? "",
      street_address_2: street_address_2 ?? "",
      city: city ?? "",
      phone: phone ?? "",
      email: email ?? "",
      is_default: is_default ?? false,
    } as never)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}
