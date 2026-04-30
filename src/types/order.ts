export type OrderItem = {
  id: string;
  title: string;
  price: number;
  discounted_price: number;
  quantity: number;
  thumbnail_image: string;
};

export type Order = {
  id: string;
  status: string;
  payment_method: string;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  created_at: string;
  order_items: OrderItem[];
};
