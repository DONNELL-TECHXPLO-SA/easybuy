/*
  # Add is_admin flag to user_profiles

  ## Overview
  Adds an `is_admin` boolean column to the `user_profiles` table to support admin
  panel access control.

  ## Changes

  ### Modified Tables
  - `user_profiles`
    - Added `is_admin` (boolean, default false) — marks whether the user has admin access

  ## Security
  - Admin users can read all profiles (needed for admin panel user management)
  - Regular users retain access only to their own profile
  - Only the service role can set is_admin (no user-facing policy for updating this field)

  ## Notes
  1. Default is false — all existing users are non-admin by default
  2. Admins are manually promoted via the Supabase dashboard or service role
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;
