-- SAFE SETUP SCRIPT (Will not fail if tables exist)

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables (Only if they don't exist)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  dob date,
  address text,
  patient_id uuid default uuid_generate_v4() not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.consents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade not null,
  allowed_fields jsonb not null default '[]'::jsonb,
  purpose text,
  expiry timestamp with time zone,
  status text check (status in ('active', 'revoked', 'expired')) default 'active',
  record_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, application_id)
);

create table if not exists public.access_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade,
  fields_accessed jsonb not null,
  purpose text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  record_hash text,
  status text
);

-- 3. Enable RLS (Safe to run multiple times)
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.consents enable row level security;
alter table public.access_logs enable row level security;

-- 4. Create Policies (Drop first to avoid "policy already exists" error)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Public can view applications" on public.applications;
create policy "Public can view applications" on public.applications for select using (true);

drop policy if exists "Users can view own consents" on public.consents;
create policy "Users can view own consents" on public.consents for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own consents" on public.consents;
create policy "Users can insert own consents" on public.consents for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own consents" on public.consents;
create policy "Users can update own consents" on public.consents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own consents" on public.consents;
create policy "Users can delete own consents" on public.consents for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own access logs" on public.access_logs;
create policy "Users can view own access logs" on public.access_logs for select using (auth.uid() = user_id);

-- 5. Seed Data (Insert only if empty to avoid duplicates)
insert into public.applications (name, description)
select 'Hospital Verification Portal', 'Official hospital portal.'
where not exists (select 1 from public.applications where name = 'Hospital Verification Portal');

-- 6. Doctor-Patient Flow Enhancements
-- Add role to profiles
alter table public.profiles add column if not exists role text default 'patient' check (role in ('patient', 'doctor'));

-- Add doctor_id to consents (nullable, as consents can be for apps OR doctors)
alter table public.consents add column if not exists doctor_id uuid references public.profiles(id);

-- Add doctor_id to access_logs
alter table public.access_logs add column if not exists doctor_id uuid references public.profiles(id);

-- 7. Secure RPC Function for Data Access
create or replace function request_patient_data(target_patient_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  requesting_doctor_id uuid;
  target_user_id uuid;
  found_consent record;
  patient_record record;
  response_data jsonb;
begin
  requesting_doctor_id := auth.uid();

  -- 1. Check if caller is a doctor
  if not exists (select 1 from public.profiles where id = requesting_doctor_id and role = 'doctor') then
    -- Log unauthorized attempt? Maybe later.
    raise exception 'Access Denied: Only doctors can request patient data.';
  end if;

  -- 2. Find Target User ID from Patient ID (UHID)
  select id into target_user_id from public.profiles where patient_id = target_patient_id;
  
  if target_user_id is null then
     raise exception 'Patient not found.';
  end if;

  -- 3. Check for active consent
  select * into found_consent
  from public.consents
  where user_id = target_user_id
    and doctor_id = requesting_doctor_id
    and status = 'active';

  if found_consent is null then
    -- Log failed attempt
    insert into public.access_logs (user_id, doctor_id, fields_accessed, purpose, status)
    values (target_user_id, requesting_doctor_id, '[]'::jsonb, 'Medical Access Request', 'denied: no_consent');
    
    raise exception 'Access Denied: No active consent found for this patient.';
  end if;

  -- 4. Fetch Patient Data
  select * into patient_record from public.profiles where id = target_user_id;

  -- 5. Filter Fields based on consent
  response_data := '{}'::jsonb;
  
  -- We assume allowed_fields is a JSONB array of strings e.g. ["full_name", "dob"]
  if found_consent.allowed_fields @> '"full_name"' then
    response_data := response_data || jsonb_build_object('full_name', patient_record.full_name);
  end if;
  
  if found_consent.allowed_fields @> '"dob"' then
    response_data := response_data || jsonb_build_object('dob', patient_record.dob);
  end if;

  if found_consent.allowed_fields @> '"address"' then
    response_data := response_data || jsonb_build_object('address', patient_record.address);
  end if;
  
  -- Always return the ID so they know they got the right person
  response_data := response_data || jsonb_build_object('patient_id', patient_record.patient_id);

  -- 6. Log Access Success
  insert into public.access_logs (user_id, doctor_id, fields_accessed, purpose, status)
  values (target_user_id, requesting_doctor_id, found_consent.allowed_fields, 'Medical Diagnosis', 'success');

  return response_data;
end;
$$;

-- 8. SCALABILITY & PERFORMANCE OPTIMIZATIONS
-- Indexing for high-frequency consent lookups (AuthZ checks)
create index if not exists idx_consents_user_doctor_status on public.consents(user_id, doctor_id, status);
create index if not exists idx_consents_user_app_status on public.consents(user_id, application_id, status);

-- Indexing for profile lookups by public ID (UHID)
create index if not exists idx_profiles_patient_id on public.profiles(patient_id);

-- 9. EXTERNAL INTEGRATION SUPPORT
-- Standardized Reusable AuthZ Function for Apps/Services
create or replace function request_app_data(target_app_id uuid, target_patient_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
  found_consent record;
  patient_record record;
  response_data jsonb;
begin
  -- 1. Resolve Patient ID
  select id into target_user_id from public.profiles where patient_id = target_patient_id;
  
  if target_user_id is null then
     raise exception 'Patient not found.';
  end if;

  -- 2. Verify Consent (Reusable Pattern)
  select * into found_consent
  from public.consents
  where user_id = target_user_id
    and application_id = target_app_id
    and status = 'active';

  if found_consent is null then
    -- Log Access Denial
    insert into public.access_logs (user_id, application_id, fields_accessed, purpose, status)
    values (target_user_id, target_app_id, '[]'::jsonb, 'External App Request', 'denied: no_consent');

    raise exception 'Access Denied: No active consent for this application.';
  end if;

  -- 3. Fetch Data
  select * into patient_record from public.profiles where id = target_user_id;

  -- 4. Modular Field Filtering (External Integration Standard)
  response_data := jsonb_build_object('patient_id', patient_record.patient_id);
  
  if found_consent.allowed_fields @> '"full_name"' then
    response_data := response_data || jsonb_build_object('full_name', patient_record.full_name);
  end if;
  if found_consent.allowed_fields @> '"dob"' then
     response_data := response_data || jsonb_build_object('dob', patient_record.dob);
  end if;
  if found_consent.allowed_fields @> '"address"' then
     response_data := response_data || jsonb_build_object('address', patient_record.address);
  end if;

  -- 5. Audit Logging
  insert into public.access_logs (user_id, application_id, fields_accessed, purpose, status)
  values (target_user_id, target_app_id, found_consent.allowed_fields, 'External API Access', 'success');

  return response_data;
end;
$$;
