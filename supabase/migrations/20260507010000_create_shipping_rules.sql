/*
  # Create shipping rules schema (idempotent)

  Adds shipping zones, methods, rate rules, and settings tables.
  Extends orders with immutable shipping snapshot fields.
*/

CREATE TABLE IF NOT EXISTS shipping_zones (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  countries jsonb NOT NULL DEFAULT '[]'::jsonb,
  regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  postal_code_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shipping_zones_code_not_blank CHECK (length(trim(code)) > 0),
  CONSTRAINT shipping_zones_countries_is_array CHECK (jsonb_typeof(countries) = 'array'),
  CONSTRAINT shipping_zones_regions_is_array CHECK (jsonb_typeof(regions) = 'array'),
  CONSTRAINT shipping_zones_postal_patterns_is_array CHECK (jsonb_typeof(postal_code_patterns) = 'array')
);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  carrier text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  allow_free_shipping boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shipping_methods_code_not_blank CHECK (length(trim(code)) > 0),
  CONSTRAINT shipping_methods_label_not_blank CHECK (length(trim(label)) > 0)
);

CREATE TABLE IF NOT EXISTS shipping_rate_rules (
  id bigserial PRIMARY KEY,
  zone_id bigint NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  method_id bigint NOT NULL REFERENCES shipping_methods(id) ON DELETE CASCADE,
  min_subtotal numeric(10, 2),
  max_subtotal numeric(10, 2),
  min_weight_grams int,
  max_weight_grams int,
  min_items int,
  max_items int,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  eta_min_days int,
  eta_max_days int,
  sort_order int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shipping_rate_rules_subtotal_range CHECK (
    min_subtotal IS NULL OR max_subtotal IS NULL OR min_subtotal <= max_subtotal
  ),
  CONSTRAINT shipping_rate_rules_weight_range CHECK (
    min_weight_grams IS NULL OR max_weight_grams IS NULL OR min_weight_grams <= max_weight_grams
  ),
  CONSTRAINT shipping_rate_rules_item_range CHECK (
    min_items IS NULL OR max_items IS NULL OR min_items <= max_items
  ),
  CONSTRAINT shipping_rate_rules_eta_range CHECK (
    eta_min_days IS NULL OR eta_max_days IS NULL OR eta_min_days <= eta_max_days
  ),
  CONSTRAINT shipping_rate_rules_unique_rule
    UNIQUE NULLS NOT DISTINCT (
      zone_id,
      method_id,
      min_subtotal,
      max_subtotal,
      min_weight_grams,
      max_weight_grams,
      min_items,
      max_items,
      sort_order
    ),
  CONSTRAINT shipping_rate_rules_non_negative_price CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS shipping_settings (
  id int PRIMARY KEY DEFAULT 1,
  free_shipping_threshold numeric(10, 2),
  default_handling_days int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shipping_settings_singleton CHECK (id = 1),
  CONSTRAINT shipping_settings_threshold_non_negative CHECK (
    free_shipping_threshold IS NULL OR free_shipping_threshold >= 0
  ),
  CONSTRAINT shipping_settings_default_handling_non_negative CHECK (default_handling_days >= 0)
);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_zones' AND policyname = 'Anyone can view active shipping zones'
  ) THEN
    CREATE POLICY "Anyone can view active shipping zones"
      ON shipping_zones FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_methods' AND policyname = 'Anyone can view active shipping methods'
  ) THEN
    CREATE POLICY "Anyone can view active shipping methods"
      ON shipping_methods FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rate_rules' AND policyname = 'Anyone can view active shipping rate rules'
  ) THEN
    CREATE POLICY "Anyone can view active shipping rate rules"
      ON shipping_rate_rules FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_settings' AND policyname = 'Anyone can view shipping settings'
  ) THEN
    CREATE POLICY "Anyone can view shipping settings"
      ON shipping_settings FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_zones' AND policyname = 'Admins can manage shipping zones'
  ) THEN
    CREATE POLICY "Admins can manage shipping zones"
      ON shipping_zones FOR ALL
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
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_methods' AND policyname = 'Admins can manage shipping methods'
  ) THEN
    CREATE POLICY "Admins can manage shipping methods"
      ON shipping_methods FOR ALL
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
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rate_rules' AND policyname = 'Admins can manage shipping rate rules'
  ) THEN
    CREATE POLICY "Admins can manage shipping rate rules"
      ON shipping_rate_rules FOR ALL
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
    SELECT 1 FROM pg_policies WHERE tablename = 'shipping_settings' AND policyname = 'Admins can manage shipping settings'
  ) THEN
    CREATE POLICY "Admins can manage shipping settings"
      ON shipping_settings FOR ALL
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

CREATE INDEX IF NOT EXISTS idx_shipping_zones_active_priority
  ON shipping_zones (is_active, priority);

CREATE INDEX IF NOT EXISTS idx_shipping_methods_active_sort
  ON shipping_methods (is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_shipping_rate_rules_zone_method_active
  ON shipping_rate_rules (zone_id, method_id, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_shipping_rate_rules_subtotal
  ON shipping_rate_rules (min_subtotal, max_subtotal);

CREATE INDEX IF NOT EXISTS idx_shipping_rate_rules_weight
  ON shipping_rate_rules (min_weight_grams, max_weight_grams);

CREATE INDEX IF NOT EXISTS idx_shipping_rate_rules_items
  ON shipping_rate_rules (min_items, max_items);

DROP TRIGGER IF EXISTS shipping_zones_updated_at ON shipping_zones;
CREATE TRIGGER shipping_zones_updated_at
  BEFORE UPDATE ON shipping_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS shipping_methods_updated_at ON shipping_methods;
CREATE TRIGGER shipping_methods_updated_at
  BEFORE UPDATE ON shipping_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS shipping_rate_rules_updated_at ON shipping_rate_rules;
CREATE TRIGGER shipping_rate_rules_updated_at
  BEFORE UPDATE ON shipping_rate_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS shipping_settings_updated_at ON shipping_settings;
CREATE TRIGGER shipping_settings_updated_at
  BEFORE UPDATE ON shipping_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method_label text NOT NULL DEFAULT '';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_zone_code text NOT NULL DEFAULT '';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_eta_min_days int;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_eta_max_days int;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_shipping_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_method_check
  CHECK (length(trim(shipping_method)) > 0);
