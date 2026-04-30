/*
  # Create Cart Items and Wishlist Items Tables

  ## Overview
  Persists per-user cart and wishlist so data survives page refreshes and
  is accessible across devices. Replaces the Redux-only in-memory state.

  ## Design Decision
  Using a flat `cart_items` table (no separate `carts` header row) for simplicity.
  The user_id on each row is sufficient to look up all items. Same for wishlist.

  ## New Tables

  ### `cart_items`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users)
  - `product_id` (int, FK → products)
  - `quantity` (int, min 1)
  - `created_at` / `updated_at` (timestamptz)
  - UNIQUE constraint on (user_id, product_id) — one row per product per user

  ### `wishlist_items`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users)
  - `product_id` (int, FK → products)
  - `created_at` (timestamptz)
  - UNIQUE constraint on (user_id, product_id)

  ## Security
  - RLS enabled on both tables
  - Users can only access their own rows
*/

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  int NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  int NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
