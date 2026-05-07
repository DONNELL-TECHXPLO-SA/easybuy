-- Add variations column to products table
ALTER TABLE products ADD COLUMN variations JSONB DEFAULT '[]'::jsonb;

-- Add selected_variations column to order_items table
ALTER TABLE order_items ADD COLUMN selected_variations JSONB DEFAULT '{}'::jsonb;

-- Add selected_variations column to cart_items table
ALTER TABLE cart_items ADD COLUMN selected_variations JSONB DEFAULT '{}'::jsonb;

-- Fix cart_items UNIQUE constraint to include variations
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_id_product_id_variations_key UNIQUE (user_id, product_id, selected_variations);
