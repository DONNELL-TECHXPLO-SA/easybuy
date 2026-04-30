/*
  # Fix handle_new_user trigger to use SECURITY DEFINER

  The trigger was failing with "Database error saving new user" because
  the function runs during signup before auth.uid() is set, so RLS
  blocks the INSERT into user_profiles.

  Setting SECURITY DEFINER makes the function run with the privileges
  of the function owner (postgres), bypassing RLS entirely for this
  system-level insert.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;
