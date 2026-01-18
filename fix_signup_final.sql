-- FINAL FIX FOR SIGNUP 500 ERROR
-- This script addresses root causes: Extension visibility, Role Constraints, and Trigger Robustness.

-- 1. Ensure Extensions are loaded in PUBLIC schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- 2. Relax and Fix Constraints on 'profiles' table
DO $$
BEGIN
    -- Drop potential conflicting constraints on 'role'
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check1;
    
    -- Add the correct constraint (inclusive of patient and doctor)
    -- We perform a check first to ensure the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_check CHECK (role IN ('patient', 'doctor', 'admin'));
    END IF;

    -- Ensure 'patient_id' has a vital default using the more compatible gen_random_uuid()
    ALTER TABLE public.profiles 
    ALTER COLUMN patient_id SET DEFAULT gen_random_uuid();
END $$;

-- 3. Robust Trigger Function Definition
-- Switched to gen_random_uuid() to avoid search_path issues with uuid-ossp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_role text;
  new_full_name text;
BEGIN
  -- Extract metadata with fallbacks
  new_role := COALESCE(new.raw_user_meta_data->>'role', 'patient');
  new_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'New User');

  -- Validate Role - Fallback to patient if invalid string passed
  IF new_role NOT IN ('patient', 'doctor', 'admin') THEN
    new_role := 'patient';
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    patient_id
  )
  VALUES (
    new.id, 
    new_full_name, 
    new_role, 
    gen_random_uuid() -- Native Postgres function, reliable
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error (visible in Supabase logs) but don't crash the Auth transaction completely if possible?
    -- Actually, we WANT it to fail so the user isn't created without a profile.
    -- But we will raise a cleaner error.
    RAISE EXCEPTION 'Profile Creation Failed: %', SQLERRM;
END;
$$;

-- 4. Clean and Recreate Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Permission Grants (Crucial for Security Definer functions sometimes)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
-- Anon and Authenticated permissions are handled by RLS policies generally, but the trigger runs as Owner (Definer)

SELECT 'Signup Fix Applied: Switched to gen_random_uuid(), Fixed Role Constraints, and Hardened Trigger' as status;
