-- RUN THIS IN SUPABASE SQL EDITOR
-- This function is required for the "Health App" simulation to work.

create or replace function request_patient_data(p_patient_id uuid, p_app_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_consent public.consents;
  v_profile public.profiles;
  v_response jsonb;
begin
  -- 1. Check if Consent exists and is active
  select * into v_consent
  from public.consents
  where user_id = (select id from public.profiles where patient_id = p_patient_id)
    and application_id = p_app_id
    and status = 'active';

  -- 2. Log the access attempt
  insert into public.access_logs (user_id, application_id, purpose, fields_accessed, status)
  select 
    (select id from public.profiles where patient_id = p_patient_id),
    p_app_id,
    'External Verification Request',
    coalesce(v_consent.allowed_fields, '[]'::jsonb),
    case when v_consent.id is not null then 'success' else 'denied' end;

  -- 3. Return Error if No Consent
  if v_consent.id is null then
    return jsonb_build_object('error', 'Consent not found or revoked.');
  end if;

  -- 4. Fetch Profile Data (Limited by scopes)
  select * into v_profile
  from public.profiles
  where patient_id = p_patient_id;

  -- 5. Construct Response based on allowed fields
  v_response := '{}'::jsonb;
  
  if v_consent.allowed_fields ? 'full_name' then
    v_response := v_response || jsonb_build_object('full_name', v_profile.full_name);
  end if;
  
  if v_consent.allowed_fields ? 'dob' then
    v_response := v_response || jsonb_build_object('dob', v_profile.dob);
  end if;
  
  if v_consent.allowed_fields ? 'address' then
    v_response := v_response || jsonb_build_object('address', v_profile.address);
  end if;

  return v_response || jsonb_build_object('status', 'Access Granted', 'timestamp', now());
end;
$$;
