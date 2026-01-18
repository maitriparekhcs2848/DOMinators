-- Fix for Practitioner Signup Error (500 Database Error)
-- This script fixes the likely cause: The 'profiles' table might have a constraint that only allows 'patient' roles.

-- 1. Enable UUID extension (ensure it exists)
create extension if not exists "uuid-ossp";

-- 2. Drop the existing constraint on the 'role' column if it exists
-- We wrap this in a DO block to safely handle if the constraint has a different name
do $$
begin
  -- Try to drop the standard named constraint
  if exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles drop constraint profiles_role_check;
  end if;
  
  -- Also attempt to drop any custom constraint that safeguards the role column if possible
  -- (Can't guess random names, but profiles_role_check is standard for Supabase if created via SQL)
end $$;

-- 3. Add the correct constraint allowing both 'patient' and 'doctor'
-- First ensure the column exists (safety check)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text default 'patient';
  end if;
end $$;

-- Now apply the constraint
alter table public.profiles 
add constraint profiles_role_check 
check (role in ('patient', 'doctor'));

-- 4. Update the trigger function to be 100% sure it handles the role metadata correctly
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, patient_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'patient'), -- Default to patient
    uuid_generate_v4()
  );
  return new;
end;
$$;

-- 5. Re-bind the trigger (just in case)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Confirmation
select 'Practitioner signup fix applied successfully' as status;
