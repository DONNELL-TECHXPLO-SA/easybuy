import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { addressId } = await params;
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
    .update({
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
    } as never)
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { addressId } = await params;

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
