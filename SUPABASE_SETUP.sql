-- 1. Create doctor_consents table
create table if not exists public.doctor_consents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.profiles(id) not null,
  status text check (status in ('active', 'revoked')) default 'active',
  allowed_fields text[] default '{}',
  purpose text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, doctor_id)
);

-- 2. Enable RLS
alter table public.doctor_consents enable row level security;

-- 3. RLS Policies
-- Patients can manage their own consents
create policy "Patients can manage their own consents"
  on public.doctor_consents
  for all
  using (auth.uid() = user_id);

-- Doctors can view consents granted to them
create policy "Doctors can view consents granted to them"
  on public.doctor_consents
  for select
  using (auth.uid() = doctor_id);

-- 4. Create RPC function for doctors to request patient data
create or replace function request_patient_data(target_patient_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  requesting_doctor_id uuid;
  consent_record record;
  patient_profile json;
begin
  requesting_doctor_id := auth.uid();

  -- Check if consent exists and is active
  select * into consent_record
  from public.doctor_consents
  where user_id = target_patient_id
    and doctor_id = requesting_doctor_id
    and status = 'active';

  if consent_record.id is null then
    raise exception 'Access Denied: No active consent found for this patient.';
  end if;

  -- Fetch patient profile
  -- Note: specific fields can be filtered based on consent_record.allowed_fields if needed.
  -- For now, we return the basic profile.
  select row_to_json(p) into patient_profile
  from public.profiles p
  where p.id = target_patient_id;

  return patient_profile;
end;
$$;
