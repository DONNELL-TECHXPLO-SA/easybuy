import type { ProductsResponse, ApiProduct, ApiCategory } from "@/types/product";

const EMPTY_RESPONSE: ProductsResponse = {
  products: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
};

export async function fetchProducts(
  params: {
    category?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    search?: string;
    page?: number;
    pageSize?: number;
    filter?: "new_arrivals" | "best_sellers" | "featured" | null;
  } = {}
): Promise<ProductsResponse> {
  try {
    const query = new URLSearchParams();
    if (params.category) query.set("category", String(params.category));
    if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.filter) query.set("filter", params.filter);

    const res = await fetch(`/api/products?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) return EMPTY_RESPONSE;
    const data = await res.json();
    return data ?? EMPTY_RESPONSE;
  } catch {
    return EMPTY_RESPONSE;
  }
}

export async function fetchProduct(id: number): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product ?? null;
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch {
    return [];
  }
}
