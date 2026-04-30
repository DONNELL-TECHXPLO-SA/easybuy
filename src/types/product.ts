export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export type ApiProduct = {
  id: number;
  title: string;
  price: number;
  discounted_price: number;
  reviews: number;
  category_id: number | null;
  thumbnail_images: string[];
  preview_images: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiCategory = {
  id: number;
  title: string;
  img: string;
  sort_order: number;
  created_at: string;
};

export type ProductsResponse = {
  products: ApiProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    discountedPrice: p.discounted_price,
    reviews: p.reviews,
    imgs: {
      thumbnails: p.thumbnail_images ?? [],
      previews: p.preview_images ?? [],
    },
  };
}
