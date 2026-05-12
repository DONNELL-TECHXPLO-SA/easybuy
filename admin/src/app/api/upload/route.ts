import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).maybeSingle();
  const profile = data as { is_admin: boolean } | null;
  return profile?.is_admin ? user : null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await assertAdmin(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!["thumbnail", "preview", "category"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${type}/${timestamp}-${random}-${file.name}`;

    const adminClient = createAdminClient();
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Upload error: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error: missing service role key" }, { status: 500 });
    }

    const bucket = type === "category" ? "category_images" : "product images";

    const { error: uploadError, data } = await adminClient.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicUrlData } = adminClient.storage
      .from(bucket)
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
