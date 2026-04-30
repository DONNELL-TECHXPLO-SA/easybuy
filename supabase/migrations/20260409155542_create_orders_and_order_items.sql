/*
  # Create Orders and Order Items Tables

  ## Overview
  Tracks all customer orders with full line-item detail.

  ## New Tables

  ### `orders`
  - `id` (uuid, PK) — unique order ID
  - `user_id` (uuid, FK → auth.users) — the placing customer
  - `status` (text) — 'pending' | 'processing' | 'on-hold' | 'delivered' | 'cancelled'
  - `payment_method` (text) — 'bank' | 'cash' | 'paypal'
  - `shipping_method` (text) — 'free' | 'fedex' | 'dhl'
  - `shipping_cost` (numeric 10,2) — resolved shipping cost at order time
  - `subtotal` (numeric 10,2) — sum of line items before shipping
  - `total` (numeric 10,2) — final amount including shipping
  - `notes` (text) — optional order notes
  - Snapshot of billing/shipping info (denormalized for immutability)
  - `created_at` / `updated_at` (timestamptz)

  ### `order_items`
  - `id` (uuid, PK)
  - `order_id` (uuid, FK → orders)
  - `product_id` (int, FK → products) — nullable in case product is later deleted
  - `title` (text) — product title snapshot
  - `price` (numeric 10,2) — original price at order time
  - `discounted_price` (numeric 10,2) — price paid per unit
  - `quantity` (int)
  - `thumbnail_image` (text) — image snapshot

  ## Security
  - RLS enabled on both tables
  - Users can read their own orders
  - Users can create orders (insert)
  - Only service role can update order status
*/

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'on-hold', 'delivered', 'cancelled')),
  payment_method      text NOT NULL DEFAULT 'bank'
                        CHECK (payment_method IN ('bank', 'cash', 'paypal')),
  shipping_method     text NOT NULL DEFAULT 'free'
                        CHECK (shipping_method IN ('free', 'fedex', 'dhl')),
  shipping_cost       numeric(10, 2) NOT NULL DEFAULT 0,
  subtotal            numeric(10, 2) NOT NULL DEFAULT 0,
  total               numeric(10, 2) NOT NULL DEFAULT 0,
  notes               text NOT NULL DEFAULT '',
  -- Billing address snapshot (immutable record)
  billing_first_name  text NOT NULL DEFAULT '',
  billing_last_name   text NOT NULL DEFAULT '',
  billing_company     text NOT NULL DEFAULT '',
  billing_country     text NOT NULL DEFAULT '',
  billing_address     text NOT NULL DEFAULT '',
  billing_address_2   text NOT NULL DEFAULT '',
  billing_city        text NOT NULL DEFAULT '',
  billing_phone       text NOT NULL DEFAULT '',
  billing_email       text NOT NULL DEFAULT '',
  -- Shipping address snapshot
  shipping_first_name text NOT NULL DEFAULT '',
  shipping_last_name  text NOT NULL DEFAULT '',
  shipping_address    text NOT NULL DEFAULT '',
  shipping_address_2  text NOT NULL DEFAULT '',
  shipping_city       text NOT NULL DEFAULT '',
  shipping_country    text NOT NULL DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        int REFERENCES products(id) ON DELETE SET NULL,
  title             text NOT NULL DEFAULT '',
  price             numeric(10, 2) NOT NULL DEFAULT 0,
  discounted_price  numeric(10, 2) NOT NULL DEFAULT 0,
  quantity          int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  thumbnail_image   text NOT NULL DEFAULT ''
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
