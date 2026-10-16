-- Run after migrations as the local database owner. All fixtures roll back.
begin;

insert into public.hospitals (id, name, enrollment_code) values
  ('10000000-0000-0000-0000-000000000001', 'Regression hospital A', 'REGRESSION_A'),
  ('10000000-0000-0000-0000-000000000002', 'Regression hospital B', 'REGRESSION_B');

insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data) values
  ('20000000-0000-0000-0000-000000000001', 'untrusted@example.invalid', '{}',
   '{"hospital_id":"10000000-0000-0000-0000-000000000002","role":"admin","display_name":"Untrusted"}'),
  ('20000000-0000-0000-0000-000000000002', 'coordinator@example.invalid',
   '{"hospital_id":"10000000-0000-0000-0000-000000000001","role":"care_coordinator"}',
   '{"hospital_id":"10000000-0000-0000-0000-000000000002","role":"admin"}'),
  ('20000000-0000-0000-0000-000000000003', 'director@example.invalid',
   '{"hospital_id":"10000000-0000-0000-0000-000000000001","role":"quality_director"}', '{}'),
  ('20000000-0000-0000-0000-000000000004', 'admin@example.invalid',
   '{"hospital_id":"10000000-0000-0000-0000-000000000001","role":"admin"}', '{}');

insert into public.patients (id, hospital_id, first_name, condition) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Regression A', 'chf'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Regression B', 'chf');

do $$
begin
  assert (select hospital_id is null and role = 'care_coordinator' and display_name = 'Untrusted'
    from public.profiles where id = '20000000-0000-0000-0000-000000000001'),
    'User metadata must not grant hospital membership or admin role';
  assert (select hospital_id = '10000000-0000-0000-0000-000000000001' and role = 'care_coordinator'
    from public.profiles where id = '20000000-0000-0000-0000-000000000002'),
    'Trusted app metadata must win over conflicting user metadata';
  assert not has_function_privilege('anon', 'public.set_patient_risk_override(uuid,text)', 'EXECUTE'),
    'Anonymous callers must not have RPC execution permission';
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', 'yellow');
do $$
begin
  assert (select risk_override = 'yellow' and first_name = 'Regression A'
    from public.patients where id = '30000000-0000-0000-0000-000000000001'),
    'Coordinator can change only the same-hospital risk override';
  begin
    perform public.set_patient_risk_override('30000000-0000-0000-0000-000000000002', 'red');
    raise exception 'Cross-hospital override unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.set_patient_risk_override('30000000-0000-0000-0000-000000000099', 'red');
    raise exception 'Missing patient override unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', 'invalid');
    raise exception 'Invalid risk override unexpectedly succeeded';
  exception when invalid_parameter_value then null;
  end;
  update public.patients set first_name = 'Forbidden' where id = '30000000-0000-0000-0000-000000000001';
  assert not found, 'Direct patient updates must still be blocked by RLS';
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000004', true);
select public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', 'red');
select public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', null);
do $$
begin
  assert (select risk_override is null from public.patients
    where id = '30000000-0000-0000-0000-000000000001'), 'Admin can clear risk override';
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000003', true);
do $$
begin
  begin
    perform public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', 'red');
    raise exception 'Quality director override unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
do $$
begin
  assert not exists (select 1 from public.patients), 'Unassigned signup must not read patients';
  begin
    perform public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', 'red');
    raise exception 'Unassigned signup override unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  begin
    perform public.set_patient_risk_override('30000000-0000-0000-0000-000000000001', 'red');
    raise exception 'Missing identity override unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

do $$
begin
  assert (select risk_override is null from public.patients
    where id = '30000000-0000-0000-0000-000000000002'), 'Other hospital patient must remain unchanged';
end;
$$;

insert into public.check_ins (id, patient_id, day_number, risk_level, status, summary) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1,
   'yellow', 'completed', 'Shortness of breath');
update public.check_ins set risk_level = 'green', summary = 'Medication taken'
  where id = '40000000-0000-0000-0000-000000000001';
do $$
begin
  assert (select risk_level = 'yellow' and summary = E'Shortness of breath\nMedication taken'
    from public.check_ins where id = '40000000-0000-0000-0000-000000000001'),
    'Lower-risk completion must preserve earlier risk and symptoms';
end;
$$;
update public.check_ins set risk_level = 'red', status = 'completed', summary = 'Chest pain'
  where id = '40000000-0000-0000-0000-000000000001';
update public.check_ins set risk_level = 'green', status = 'completed', summary = 'Medication taken'
  where id = '40000000-0000-0000-0000-000000000001';
do $$
begin
  assert (select risk_level = 'red' and status = 'escalated'
    and summary = E'Shortness of breath\nMedication taken\nChest pain'
    from public.check_ins where id = '40000000-0000-0000-0000-000000000001'),
    'Stale completion must preserve escalation and not duplicate summary';
end;
$$;
update public.check_ins set risk_level = null, summary = null
  where id = '40000000-0000-0000-0000-000000000001';
do $$
begin
  assert (select risk_level = 'red' and status = 'escalated' and summary is not null
    from public.check_ins where id = '40000000-0000-0000-0000-000000000001'),
    'Null update must not erase clinical findings';
end;
$$;

rollback;
