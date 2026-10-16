-- Authorization attributes must come from the Admin API's app_metadata.
-- User-editable metadata is suitable only for non-authoritative display data.
-- Existing profiles are deliberately unchanged; audit their assignments against
-- trusted hospital staff/invitation records before deploying (see tests/README.md).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, hospital_id, role, display_name)
  values (
    new.id,
    nullif(new.raw_app_meta_data ->> 'hospital_id', '')::uuid,
    coalesce(new.raw_app_meta_data ->> 'role', 'care_coordinator'),
    new.raw_user_meta_data ->> 'display_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- A narrow write API: neither patient demographics nor hospital membership can
-- be modified through this function. Table-level UPDATE remains denied by RLS.
create or replace function public.set_patient_risk_override(
  p_patient_id uuid,
  p_risk text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_hospital_id uuid;
begin
  select hospital_id into caller_hospital_id
  from public.profiles
  where id = auth.uid()
    and role in ('care_coordinator', 'admin');

  if caller_hospital_id is null then
    raise exception 'Not authorized to override patient risk'
      using errcode = '42501';
  end if;

  if p_risk is not null and p_risk not in ('red', 'yellow', 'green') then
    raise exception 'Invalid risk level' using errcode = '22023';
  end if;

  update public.patients
  set risk_override = p_risk
  where id = p_patient_id and hospital_id = caller_hospital_id;

  if not found then
    -- Do not disclose whether a patient exists in another hospital.
    raise exception 'Patient not found or not authorized'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.set_patient_risk_override(uuid, text) from public;
revoke all on function public.set_patient_risk_override(uuid, text) from anon;
grant execute on function public.set_patient_risk_override(uuid, text) to authenticated;
