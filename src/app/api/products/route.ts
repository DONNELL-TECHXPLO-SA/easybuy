import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categoryId = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "12", 10);
    const filter = searchParams.get("filter");
    const offset = (page - 1) * pageSize;

    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*", { count: "exact" });

    if (categoryId) {
      query = query.eq("category_id", parseInt(categoryId, 10));
    }

    if (minPrice) {
      query = query.gte("discounted_price", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("discounted_price", parseFloat(maxPrice));
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (filter === "new_arrivals") {
      query = query.eq("is_new_arrival", true);
    } else if (filter === "best_sellers") {
      query = query.eq("is_best_seller", true);
    } else if (filter === "featured") {
      query = query.eq("is_featured", true);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      products: data,
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
