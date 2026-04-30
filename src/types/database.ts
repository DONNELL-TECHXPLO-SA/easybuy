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
        Row: {
          id: number;
          title: string;
          img: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          img?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          img?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
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
        Insert: {
          id?: number;
          title: string;
          price?: number;
          discounted_price?: number;
          reviews?: number;
          category_id?: number | null;
          thumbnail_images?: string[];
          preview_images?: string[];
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_best_seller?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          price?: number;
          discounted_price?: number;
          reviews?: number;
          category_id?: number | null;
          thumbnail_images?: string[];
          preview_images?: string[];
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_best_seller?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          country: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          country?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          country?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: "billing" | "shipping" | "both";
          first_name: string;
          last_name: string;
          company: string;
          country: string;
          street_address: string;
          street_address_2: string;
          city: string;
          phone: string;
          email: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: "billing" | "shipping" | "both";
          first_name?: string;
          last_name?: string;
          company?: string;
          country?: string;
          street_address?: string;
          street_address_2?: string;
          city?: string;
          phone?: string;
          email?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "billing" | "shipping" | "both";
          first_name?: string;
          last_name?: string;
          company?: string;
          country?: string;
          street_address?: string;
          street_address_2?: string;
          city?: string;
          phone?: string;
          email?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "processing" | "on-hold" | "delivered" | "cancelled";
          payment_method: "bank" | "cash" | "paypal";
          shipping_method: "free" | "fedex" | "dhl";
          shipping_cost: number;
          subtotal: number;
          total: number;
          notes: string;
          billing_first_name: string;
          billing_last_name: string;
          billing_company: string;
          billing_country: string;
          billing_address: string;
          billing_address_2: string;
          billing_city: string;
          billing_phone: string;
          billing_email: string;
          shipping_first_name: string;
          shipping_last_name: string;
          shipping_address: string;
          shipping_address_2: string;
          shipping_city: string;
          shipping_country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: "pending" | "processing" | "on-hold" | "delivered" | "cancelled";
          payment_method?: "bank" | "cash" | "paypal";
          shipping_method?: "free" | "fedex" | "dhl";
          shipping_cost?: number;
          subtotal?: number;
          total?: number;
          notes?: string;
          billing_first_name?: string;
          billing_last_name?: string;
          billing_company?: string;
          billing_country?: string;
          billing_address?: string;
          billing_address_2?: string;
          billing_city?: string;
          billing_phone?: string;
          billing_email?: string;
          shipping_first_name?: string;
          shipping_last_name?: string;
          shipping_address?: string;
          shipping_address_2?: string;
          shipping_city?: string;
          shipping_country?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: "pending" | "processing" | "on-hold" | "delivered" | "cancelled";
          payment_method?: "bank" | "cash" | "paypal";
          shipping_method?: "free" | "fedex" | "dhl";
          shipping_cost?: number;
          subtotal?: number;
          total?: number;
          notes?: string;
          billing_first_name?: string;
          billing_last_name?: string;
          billing_company?: string;
          billing_country?: string;
          billing_address?: string;
          billing_address_2?: string;
          billing_city?: string;
          billing_phone?: string;
          billing_email?: string;
          shipping_first_name?: string;
          shipping_last_name?: string;
          shipping_address?: string;
          shipping_address_2?: string;
          shipping_city?: string;
          shipping_country?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: number | null;
          title: string;
          price: number;
          discounted_price: number;
          quantity: number;
          thumbnail_image: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: number | null;
          title?: string;
          price?: number;
          discounted_price?: number;
          quantity?: number;
          thumbnail_image?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: number | null;
          title?: string;
          price?: number;
          discounted_price?: number;
          quantity?: number;
          thumbnail_image?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: number;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: number;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: number;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: number;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: number;
          title: string;
          content: string;
          excerpt: string;
          img: string;
          views: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content?: string;
          excerpt?: string;
          img?: string;
          views?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          excerpt?: string;
          img?: string;
          views?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: number;
          review: string;
          author_name: string;
          author_role: string;
          author_img: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          review: string;
          author_name: string;
          author_role?: string;
          author_img?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          review?: string;
          author_name?: string;
          author_role?: string;
          author_img?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          subject: string;
          phone: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name?: string;
          subject?: string;
          phone?: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          subject?: string;
          phone?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      promotions: {
        Row: {
          id: number;
          title: string;
          subtitle: string;
          discount_label: string;
          description: string;
          image_url: string;
          button_text: string;
          button_link: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          subtitle?: string;
          discount_label?: string;
          description?: string;
          image_url?: string;
          button_text?: string;
          button_link?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          subtitle?: string;
          discount_label?: string;
          description?: string;
          image_url?: string;
          button_text?: string;
          button_link?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          store_name: string;
          support_phone: string;
          support_email: string;
          store_address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          support_phone?: string;
          support_email?: string;
          store_address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          store_name?: string;
          support_phone?: string;
          support_email?: string;
          store_address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: "pending" | "processing" | "on-hold" | "delivered" | "cancelled";
      payment_method: "bank" | "cash" | "paypal";
      shipping_method: "free" | "fedex" | "dhl";
      address_type: "billing" | "shipping" | "both";
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type DbCategory = Tables<"categories">;
export type DbProduct = Tables<"products">;
export type DbUserProfile = Tables<"user_profiles">;
export type DbAddress = Tables<"addresses">;
export type DbOrder = Tables<"orders">;
export type DbOrderItem = Tables<"order_items">;
export type DbCartItem = Tables<"cart_items">;
export type DbWishlistItem = Tables<"wishlist_items">;
export type DbBlogPost = Tables<"blog_posts">;
export type DbTestimonial = Tables<"testimonials">;
export type DbContactMessage = Tables<"contact_messages">;
export type DbPromotion = Tables<"promotions">;
export type DbSiteSettings = Tables<"site_settings">;

export type OrderStatus = "pending" | "processing" | "on-hold" | "delivered" | "cancelled";
export type PaymentMethod = "bank" | "cash" | "paypal";
export type ShippingMethod = "free" | "fedex" | "dhl";
export type AddressType = "billing" | "shipping" | "both";
