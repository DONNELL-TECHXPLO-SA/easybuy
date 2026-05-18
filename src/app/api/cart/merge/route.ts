import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    for (const item of items) {
      const { id: product_id, quantity, selectedVariations = {} } = item;
      
      // Check if item already exists in DB
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product_id)
        .eq("selected_variations", selectedVariations)
        .maybeSingle() as { data: { id: string; quantity: number } | null };

      if (existing) {
        const newQuantity = existing.quantity + (quantity as number);
        await supabase
          .from("cart_items")
          .update({ quantity: newQuantity } as never)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ 
            user_id: user.id, 
            product_id, 
            quantity, 
            selected_variations: selectedVariations 
          } as never);
      }
    }

    // Return the updated cart
    const { data: updatedCart, error: fetchError } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        product_id,
        selected_variations,
        products (
          id,
          title,
          price,
          discounted_price,
          thumbnail_images,
          preview_images
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch updated cart" }, { status: 500 });
    }

    return NextResponse.json({ items: updatedCart });
  } catch (error) {
    console.error("Cart merge error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
