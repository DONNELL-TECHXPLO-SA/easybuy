export type OrderItem = {
  id: string;
  title: string;
  price: number;
  discounted_price: number;
  quantity: number;
  thumbnail_image: string;
  selected_variations?: Record<string, string>;
};

export type Order = {
  id: string;
  status: string;
  payment_method: string;
  shipping_method: string;
  shipping_method_label?: string;
  shipping_zone_code?: string;
  shipping_eta_min_days?: number | null;
  shipping_eta_max_days?: number | null;
  shipping_cost: number;
  subtotal: number;
  total: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  created_at: string;
  order_items: OrderItem[];
};
