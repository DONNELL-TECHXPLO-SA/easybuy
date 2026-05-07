/*
  # Seed baseline shipping rules (idempotent)

  Seeds shipping zones, methods, settings, and starter rates.
*/

INSERT INTO shipping_settings (id, free_shipping_threshold, default_handling_days)
VALUES (1, 1000.00, 1)
ON CONFLICT (id) DO UPDATE
SET
  free_shipping_threshold = EXCLUDED.free_shipping_threshold,
  default_handling_days = EXCLUDED.default_handling_days,
  updated_at = now();

INSERT INTO shipping_zones (
  code,
  name,
  countries,
  regions,
  postal_code_patterns,
  priority,
  is_active
)
VALUES
  (
    'ZA_METRO',
    'South Africa Metro Areas',
    '["za"]'::jsonb,
    '[]'::jsonb,
    '["2*", "4*", "6*", "7*"]'::jsonb,
    10,
    true
  ),
  (
    'ZA_NATIONAL',
    'South Africa Nationwide',
    '["za"]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    100,
    true
  ),
  (
    'INTL_DEFAULT',
    'International Default',
    '["*"]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    1000,
    true
  )
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  countries = EXCLUDED.countries,
  regions = EXCLUDED.regions,
  postal_code_patterns = EXCLUDED.postal_code_patterns,
  priority = EXCLUDED.priority,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO shipping_methods (
  code,
  label,
  carrier,
  description,
  sort_order,
  is_active,
  allow_free_shipping
)
VALUES
  (
    'free',
    'Free Shipping',
    'EasyBuy',
    'Free shipping for qualifying baskets',
    10,
    true,
    true
  ),
  (
    'fedex',
    'FedEx Standard',
    'FedEx',
    'Tracked standard delivery',
    20,
    true,
    false
  ),
  (
    'dhl',
    'DHL Express',
    'DHL',
    'Fast tracked delivery',
    30,
    true,
    false
  )
ON CONFLICT (code) DO UPDATE
SET
  label = EXCLUDED.label,
  carrier = EXCLUDED.carrier,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  allow_free_shipping = EXCLUDED.allow_free_shipping,
  updated_at = now();

WITH zone_method_rules AS (
  SELECT
    z.id AS zone_id,
    m.id AS method_id,
    r.min_subtotal,
    r.max_subtotal,
    r.min_weight_grams,
    r.max_weight_grams,
    r.min_items,
    r.max_items,
    r.price,
    r.eta_min_days,
    r.eta_max_days,
    r.sort_order,
    r.is_active
  FROM (
    VALUES
      -- Metro free shipping when subtotal is >= threshold
      ('ZA_METRO', 'free', 1000.00::numeric, NULL::numeric, NULL::int, NULL::int, NULL::int, NULL::int, 0.00::numeric, 2::int, 4::int, 10::int, true),
      -- Metro paid methods
      ('ZA_METRO', 'fedex', NULL::numeric, NULL::numeric, NULL::int, 5000::int, NULL::int, NULL::int, 89.00::numeric, 2::int, 4::int, 20::int, true),
      ('ZA_METRO', 'dhl', NULL::numeric, NULL::numeric, NULL::int, 5000::int, NULL::int, NULL::int, 149.00::numeric, 1::int, 2::int, 30::int, true),

      -- National free shipping threshold
      ('ZA_NATIONAL', 'free', 1200.00::numeric, NULL::numeric, NULL::int, NULL::int, NULL::int, NULL::int, 0.00::numeric, 3::int, 6::int, 10::int, true),
      -- National paid methods
      ('ZA_NATIONAL', 'fedex', NULL::numeric, NULL::numeric, NULL::int, 5000::int, NULL::int, NULL::int, 109.00::numeric, 3::int, 6::int, 20::int, true),
      ('ZA_NATIONAL', 'dhl', NULL::numeric, NULL::numeric, NULL::int, 5000::int, NULL::int, NULL::int, 169.00::numeric, 2::int, 4::int, 30::int, true),

      -- International defaults
      ('INTL_DEFAULT', 'fedex', NULL::numeric, NULL::numeric, NULL::int, 5000::int, NULL::int, NULL::int, 349.00::numeric, 5::int, 10::int, 20::int, true),
      ('INTL_DEFAULT', 'dhl', NULL::numeric, NULL::numeric, NULL::int, 5000::int, NULL::int, NULL::int, 499.00::numeric, 3::int, 7::int, 30::int, true)
  ) AS r(
    zone_code,
    method_code,
    min_subtotal,
    max_subtotal,
    min_weight_grams,
    max_weight_grams,
    min_items,
    max_items,
    price,
    eta_min_days,
    eta_max_days,
    sort_order,
    is_active
  )
  JOIN shipping_zones z ON z.code = r.zone_code
  JOIN shipping_methods m ON m.code = r.method_code
)
INSERT INTO shipping_rate_rules (
  zone_id,
  method_id,
  min_subtotal,
  max_subtotal,
  min_weight_grams,
  max_weight_grams,
  min_items,
  max_items,
  price,
  eta_min_days,
  eta_max_days,
  sort_order,
  is_active
)
SELECT
  zone_id,
  method_id,
  min_subtotal,
  max_subtotal,
  min_weight_grams,
  max_weight_grams,
  min_items,
  max_items,
  price,
  eta_min_days,
  eta_max_days,
  sort_order,
  is_active
FROM zone_method_rules
ON CONFLICT ON CONSTRAINT shipping_rate_rules_unique_rule
DO UPDATE
SET
  price = EXCLUDED.price,
  eta_min_days = EXCLUDED.eta_min_days,
  eta_max_days = EXCLUDED.eta_max_days,
  is_active = EXCLUDED.is_active,
  updated_at = now();
