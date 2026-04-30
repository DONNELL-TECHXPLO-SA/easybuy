/*
  # Create User Profiles and Addresses Tables

  ## Overview
  Extends Supabase auth.users with profile data and shipping/billing addresses.

  ## New Tables

  ### `user_profiles`
  Linked 1:1 to auth.users. Stores display info not in auth.
  - `id` (uuid, PK, FK → auth.users) — same ID as auth user
  - `first_name` (text)
  - `last_name` (text)
  - `phone` (text)
  - `country` (text)
  - `created_at` / `updated_at` (timestamptz)

  ### `addresses`
  Multiple addresses per user (billing or shipping).
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users)
  - `type` (text) — 'billing' | 'shipping' | 'both'
  - `first_name`, `last_name` (text)
  - `company` (text, optional)
  - `country` (text)
  - `street_address` (text)
  - `street_address_2` (text, optional)
  - `city` (text)
  - `phone` (text)
  - `email` (text)
  - `is_default` (boolean) — default address flag
  - `created_at` / `updated_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Users can only read/write their own data
*/

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name   text NOT NULL DEFAULT '',
  last_name    text NOT NULL DEFAULT '',
  phone        text NOT NULL DEFAULT '',
  country      text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              text NOT NULL DEFAULT 'shipping' CHECK (type IN ('billing', 'shipping', 'both')),
  first_name        text NOT NULL DEFAULT '',
  last_name         text NOT NULL DEFAULT '',
  company           text NOT NULL DEFAULT '',
  country           text NOT NULL DEFAULT '',
  street_address    text NOT NULL DEFAULT '',
  street_address_2  text NOT NULL DEFAULT '',
  city              text NOT NULL DEFAULT '',
  phone             text NOT NULL DEFAULT '',
  email             text NOT NULL DEFAULT '',
  is_default        boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
