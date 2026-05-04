/*
  # Add Admin RLS Policies for Products and Categories

  ## Overview
  Adds Row-Level Security policies to allow admin users to create, update, and delete
  products and categories while maintaining public read access.

  ## Changes
  - Products table: Add INSERT, UPDATE, DELETE policies for admins
  - Categories table: Add INSERT, UPDATE, DELETE policies for admins
  - Admin check verifies user has is_admin = true in user_profiles
*/

-- Products table: INSERT policy for admins
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ));

-- Products table: UPDATE policy for admins
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ));

-- Products table: DELETE policy for admins
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ));

-- Categories table: INSERT policy for admins
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ));

-- Categories table: UPDATE policy for admins
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ));

-- Categories table: DELETE policy for admins
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ));
