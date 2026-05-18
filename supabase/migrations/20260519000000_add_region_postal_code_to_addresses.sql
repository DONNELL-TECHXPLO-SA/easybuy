/*
  # Add region and postal_code to addresses

  Adds `region` and `postal_code` columns to the `addresses` table
  so saved addresses can fully populate checkout fields.

  ## Changes
  - `addresses.region` (text, default '')
  - `addresses.postal_code` (text, default '')
*/

ALTER TABLE addresses
  ADD COLUMN IF NOT EXISTS region     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_code text NOT NULL DEFAULT '';
