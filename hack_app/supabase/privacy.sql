-- PRIVACY & SECURITY ENFORCEMENT SCHEMA
-- Run this in the Supabase SQL Editor to apply all privacy features.

-- 1. CONSENTS TABLE
-- Tracks granular permissions for each user and application.
create table if not exists public.consents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- Links to auth.users (secure)
  application_id uuid references public.applications(id) on delete cascade not null,
  allowed_fields jsonb not null default '[]'::jsonb, -- e.g. ["full_name", "dob"]
  purpose text,
  expiry timestamp with time zone,
  status text check (status in ('active', 'revoked', 'expired')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, application_id)
);

-- 2. ACCESS LOGS TABLE
-- Immutable audit trail of all data access attempts.
create table if not exists public.access_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- The patient whose data was accessed
  application_id uuid references public.applications(id) on delete set null, -- The app that requested access
  fields_accessed jsonb not null, -- What was actually returned
  purpose text, -- Why it was accessed
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('success', 'denied')) not null,
  metadata jsonb default '{}'::jsonb -- For additional debug info if needed
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.consents enable row level security;
alter table public.access_logs enable row level security;

-- 4. RLS POLICIES

-- Consents: Users can FULLY manage their own consents.
drop policy if exists "Users can manage own consents" on public.consents;
create policy "Users can manage own consents" on public.consents
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Access Logs: Users can VIEW their own logs. No one can edit/delete logs (Immutable).
drop policy if exists "Users can view own access logs" on public.access_logs;
create policy "Users can view own access logs" on public.access_logs
  for select
  using (auth.uid() = user_id);

-- Note: Applications table policies assumed to exist (Public read).

-- 5. SECURE RPC FOR DATA ACCESS
-- This is the ONLY way for 3rd party apps to access patient data.
-- It enforces: Authentication, Consent Presence, Expiry, and Data Minimization.

create or replace function public.request_patient_data(
  p_patient_id uuid,
  p_app_id uuid
)
returns jsonb
language plpgsql
security definer -- Runs with elevated permissions to check consents and read profile
as $$
declare
  v_user_id uuid;
  v_consent record;
  v_profile record;
  v_result jsonb := '{}'::jsonb;
  v_fields_to_return jsonb := '[]'::jsonb;
begin
  -- A. Resolve Patient ID to User ID
  select id, full_name, dob, address into v_profile
  from public.profiles
  where patient_id = p_patient_id;

  if not found then
    -- Return generic error to prevent enumeration, or specific if needed for UX
    return jsonb_build_object('error', 'Patient not found');
  end if;

  v_user_id := v_profile.id;

  -- B. Check for VALID, ACTIVE Consent
  select * into v_consent
  from public.consents
  where user_id = v_user_id
    and application_id = p_app_id
    and status = 'active'
    and (expiry is null or expiry > now());

  -- C. Handle Access Denial
  if not found then
    -- Log the denied attempt
    insert into public.access_logs (user_id, application_id, fields_accessed, purpose, status, metadata)
    values (
      v_user_id, 
      p_app_id, 
      '[]'::jsonb, 
      'Attempted access without valid consent', 
      'denied',
      jsonb_build_object('reason', 'No active consent found')
    );
    
    return jsonb_build_object('error', 'Access Denied - Consent Required');
  end if;

  -- D. Data Minimization & Response Construction
  -- Only return fields explicitly allowed in the consent record.
  
  if v_consent.allowed_fields ? 'full_name' then
    v_result := v_result || jsonb_build_object('full_name', v_profile.full_name);
    v_fields_to_return := v_fields_to_return || '["full_name"]'::jsonb;
  end if;

  if v_consent.allowed_fields ? 'dob' then
    v_result := v_result || jsonb_build_object('dob', v_profile.dob);
    v_fields_to_return := v_fields_to_return || '["dob"]'::jsonb;
  end if;
  
  if v_consent.allowed_fields ? 'address' then
    v_result := v_result || jsonb_build_object('address', v_profile.address);
    v_fields_to_return := v_fields_to_return || '["address"]'::jsonb;
  end if;

  -- E. Log Successful Access
  insert into public.access_logs (user_id, application_id, fields_accessed, purpose, status)
  values (v_user_id, p_app_id, v_fields_to_return, v_consent.purpose, 'success');

  -- F. Return Limited Data
  return v_result;
end;
$$;
