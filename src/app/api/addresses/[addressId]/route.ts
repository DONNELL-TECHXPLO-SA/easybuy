import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addressUpdateSchema = z.object({
  type: z.enum(["billing", "shipping", "both"]).optional(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  street_address: z.string().max(500).optional(),
  street_address_2: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  is_default: z.boolean().optional(),
});

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
  const parsed = addressUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(parsed.data as never)
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
