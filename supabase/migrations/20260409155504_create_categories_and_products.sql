/*
  # Create Categories and Products Tables

  ## Overview
  Core product catalog tables for the e-commerce platform.

  ## New Tables

  ### `categories`
  - `id` (serial, primary key) — auto-incrementing category ID
  - `title` (text) — display name of the category
  - `img` (text) — image path for the category
  - `sort_order` (int) — display order
  - `created_at` (timestamptz) — creation timestamp

  ### `products`
  - `id` (serial, primary key) — auto-incrementing product ID
  - `title` (text) — product name
  - `price` (numeric 10,2) — original price in ZAR
  - `discounted_price` (numeric 10,2) — sale price in ZAR
  - `reviews` (int) — number of reviews
  - `category_id` (int, FK → categories) — category reference
  - `thumbnail_images` (text[]) — array of thumbnail image paths
  - `preview_images` (text[]) — array of full-size preview image paths
  - `is_featured` (boolean) — whether product appears in featured sections
  - `is_new_arrival` (boolean) — whether product is a new arrival
  - `is_best_seller` (boolean) — whether product is a bestseller
  - `created_at` / `updated_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Public read access (product catalog is public)
  - Only service role can write (admin operations)
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          serial PRIMARY KEY,
  title       text NOT NULL,
  img         text NOT NULL DEFAULT '',
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id                serial PRIMARY KEY,
  title             text NOT NULL,
  price             numeric(10, 2) NOT NULL DEFAULT 0,
  discounted_price  numeric(10, 2) NOT NULL DEFAULT 0,
  reviews           int NOT NULL DEFAULT 0,
  category_id       int REFERENCES categories(id) ON DELETE SET NULL,
  thumbnail_images  text[] NOT NULL DEFAULT '{}',
  preview_images    text[] NOT NULL DEFAULT '{}',
  is_featured       boolean NOT NULL DEFAULT false,
  is_new_arrival    boolean NOT NULL DEFAULT false,
  is_best_seller    boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller);
