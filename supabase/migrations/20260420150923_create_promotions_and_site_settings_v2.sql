/*
  # Create promotions and site_settings tables (idempotent)

  Creates promotions and site_settings tables if they don't exist,
  and adds RLS policies only if they don't already exist.
*/

-- promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id serial PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  discount_label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  button_text text NOT NULL DEFAULT 'Shop Now',
  button_link text NOT NULL DEFAULT '/',
  is_active boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Anyone can view active promotions'
  ) THEN
    CREATE POLICY "Anyone can view active promotions"
      ON promotions FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Admins can view all promotions'
  ) THEN
    CREATE POLICY "Admins can view all promotions"
      ON promotions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Admins can insert promotions'
  ) THEN
    CREATE POLICY "Admins can insert promotions"
      ON promotions FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Admins can update promotions'
  ) THEN
    CREATE POLICY "Admins can update promotions"
      ON promotions FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Admins can delete promotions'
  ) THEN
    CREATE POLICY "Admins can delete promotions"
      ON promotions FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- site_settings table (singleton)
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  store_name text NOT NULL DEFAULT 'NextCommerce',
  support_phone text NOT NULL DEFAULT '',
  support_email text NOT NULL DEFAULT '',
  store_address text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admins can view site settings'
  ) THEN
    CREATE POLICY "Admins can view site settings"
      ON site_settings FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admins can update site settings'
  ) THEN
    CREATE POLICY "Admins can update site settings"
      ON site_settings FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Seed default settings row
INSERT INTO site_settings (id, store_name, support_phone, support_email, store_address)
VALUES (1, 'NextCommerce', '', '', '')
ON CONFLICT (id) DO NOTHING;
