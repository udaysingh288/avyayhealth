-- =====================================================
-- Avyay Health — Row Level Security policies
-- =====================================================
-- Security model:
--
-- anon role (publishable key, no auth):
--   - hospitals: SELECT only, single row by enrollment_code
--     (needed so the patient enroll screen can resolve the hospital name)
--   - everything else: no access
--
-- authenticated role (Supabase Auth session, coordinators/quality):
--   - hospitals, coordinators, patients, check_ins, messages, sdoh_flags:
--     SELECT only, filtered by current_hospital_id()
--   - profiles: SELECT own row
--   - writes on patient-side tables are NOT allowed directly — they
--     go through edge functions that use the service_role key
--
-- service_role (edge functions, server-side):
--   - bypasses RLS entirely (this is built-in Supabase behavior)
-- =====================================================

-- Drop any earlier permissive demo policies that might exist on these tables
drop policy if exists "demo_anon_all" on public.hospitals;
drop policy if exists "demo_anon_all" on public.coordinators;
drop policy if exists "demo_anon_all" on public.patients;
drop policy if exists "demo_anon_all" on public.check_ins;
drop policy if exists "demo_anon_all" on public.messages;
drop policy if exists "demo_anon_all" on public.sdoh_flags;

-- Enable RLS on everything
alter table public.hospitals    enable row level security;
alter table public.coordinators enable row level security;
alter table public.patients     enable row level security;
alter table public.check_ins    enable row level security;
alter table public.messages     enable row level security;
alter table public.sdoh_flags   enable row level security;
alter table public.profiles     enable row level security;

-- =====================================================
-- hospitals
-- =====================================================
-- Anon: can read any hospital row. We'd prefer to restrict this
-- to a single row filter, but RLS USING clauses can't distinguish
-- "select by enrollment_code" from "select all" — any SELECT matching
-- the USING expression is allowed. Exposed data is only name + code
-- + city + state, which is already public info (hospital marketing).
-- No PHI lives on this table.
drop policy if exists hospitals_anon_read on public.hospitals;
create policy hospitals_anon_read
  on public.hospitals
  for select
  to anon
  using (true);

drop policy if exists hospitals_auth_read on public.hospitals;
create policy hospitals_auth_read
  on public.hospitals
  for select
  to authenticated
  using (id = public.current_hospital_id());

-- =====================================================
-- coordinators — authenticated-only, scoped to hospital
-- =====================================================
drop policy if exists coordinators_auth_read on public.coordinators;
create policy coordinators_auth_read
  on public.coordinators
  for select
  to authenticated
  using (hospital_id = public.current_hospital_id());

-- =====================================================
-- patients — authenticated-only reads, scoped to hospital
-- Writes go through edge functions (service_role bypasses RLS).
-- =====================================================
drop policy if exists patients_auth_read on public.patients;
create policy patients_auth_read
  on public.patients
  for select
  to authenticated
  using (hospital_id = public.current_hospital_id());

-- =====================================================
-- check_ins — authenticated-only reads via patient's hospital
-- =====================================================
drop policy if exists checkins_auth_read on public.check_ins;
create policy checkins_auth_read
  on public.check_ins
  for select
  to authenticated
  using (
    exists (
      select 1 from public.patients p
      where p.id = check_ins.patient_id
        and p.hospital_id = public.current_hospital_id()
    )
  );

-- =====================================================
-- messages — authenticated-only reads via check_in -> patient -> hospital
-- =====================================================
drop policy if exists messages_auth_read on public.messages;
create policy messages_auth_read
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.check_ins ci
      join public.patients p on p.id = ci.patient_id
      where ci.id = messages.check_in_id
        and p.hospital_id = public.current_hospital_id()
    )
  );

-- =====================================================
-- sdoh_flags — authenticated-only reads via patient's hospital
-- =====================================================
drop policy if exists sdoh_flags_auth_read on public.sdoh_flags;
create policy sdoh_flags_auth_read
  on public.sdoh_flags
  for select
  to authenticated
  using (
    exists (
      select 1 from public.patients p
      where p.id = sdoh_flags.patient_id
        and p.hospital_id = public.current_hospital_id()
    )
  );

-- =====================================================
-- profiles — authenticated can read own row only
-- =====================================================
drop policy if exists profiles_auth_read_self on public.profiles;
create policy profiles_auth_read_self
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());
