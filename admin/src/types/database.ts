export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      categories: {
        Row: { id: number; title: string; img: string; sort_order: number; created_at: string };
        Insert: { id?: number; title: string; img?: string; sort_order?: number; created_at?: string };
        Update: { id?: number; title?: string; img?: string; sort_order?: number; created_at?: string };
      };
      products: {
        Row: { id: number; title: string; price: number; discounted_price: number; reviews: number; category_id: number | null; thumbnail_images: string[]; preview_images: string[]; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean; created_at: string; updated_at: string };
        Insert: { id?: number; title: string; price?: number; discounted_price?: number; reviews?: number; category_id?: number | null; thumbnail_images?: string[]; preview_images?: string[]; is_featured?: boolean; is_new_arrival?: boolean; is_best_seller?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: number; title?: string; price?: number; discounted_price?: number; reviews?: number; category_id?: number | null; thumbnail_images?: string[]; preview_images?: string[]; is_featured?: boolean; is_new_arrival?: boolean; is_best_seller?: boolean; created_at?: string; updated_at?: string };
      };
      user_profiles: {
        Row: { id: string; first_name: string; last_name: string; phone: string; country: string; is_admin: boolean; created_at: string; updated_at: string };
        Insert: { id: string; first_name?: string; last_name?: string; phone?: string; country?: string; is_admin?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; first_name?: string; last_name?: string; phone?: string; country?: string; is_admin?: boolean; created_at?: string; updated_at?: string };
      };
      orders: {
        Row: { id: string; user_id: string; status: string; payment_method: string; shipping_method: string; shipping_cost: number; subtotal: number; total: number; notes: string; billing_first_name: string; billing_last_name: string; billing_company: string; billing_country: string; billing_address: string; billing_address_2: string; billing_city: string; billing_phone: string; billing_email: string; shipping_first_name: string; shipping_last_name: string; shipping_address: string; shipping_address_2: string; shipping_city: string; shipping_country: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; status?: string; total?: number; billing_first_name?: string; billing_last_name?: string; billing_email?: string; created_at?: string; updated_at?: string };
        Update: { id?: string; status?: string; updated_at?: string };
      };
      order_items: {
        Row: { id: string; order_id: string; product_id: number | null; title: string; price: number; discounted_price: number; quantity: number; thumbnail_image: string };
        Insert: { id?: string; order_id: string; product_id?: number | null; title?: string; price?: number; discounted_price?: number; quantity?: number; thumbnail_image?: string };
        Update: Record<string, never>;
      };
      promotions: {
        Row: { id: number; title: string; subtitle: string; discount_label: string; description: string; image_url: string; button_text: string; button_link: string; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: number; title: string; subtitle?: string; discount_label?: string; description?: string; image_url?: string; button_text?: string; button_link?: string; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: { id?: number; title?: string; subtitle?: string; discount_label?: string; description?: string; image_url?: string; button_text?: string; button_link?: string; is_active?: boolean; sort_order?: number; updated_at?: string };
      };
      site_settings: {
        Row: { id: number; store_name: string; support_phone: string; support_email: string; store_address: string; created_at: string; updated_at: string };
        Insert: { id?: number; store_name?: string; support_phone?: string; support_email?: string; store_address?: string; created_at?: string; updated_at?: string };
        Update: { id?: number; store_name?: string; support_phone?: string; support_email?: string; store_address?: string; updated_at?: string };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type DbUserProfile = Tables<"user_profiles">;
export type DbProduct = Tables<"products">;
export type DbCategory = Tables<"categories">;
export type DbOrder = Tables<"orders">;
export type DbPromotion = Tables<"promotions">;
export type DbSiteSettings = Tables<"site_settings">;
