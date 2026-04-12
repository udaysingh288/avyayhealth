-- =====================================================
-- Avyay Health — demo seed data
-- =====================================================
-- Run this after migrations have been applied. It's idempotent
-- so it's safe to re-run.
--
-- Creates:
--   - 2 hospitals (Riverside, St. Vincent)
--   - 3 care coordinators at Riverside (Sarah, Marcus, Priya)
--   - 1 quality director at Riverside (Maya)
--
-- These rows represent the public-facing care team entries.
-- Supabase Auth users are created separately by scripts/create-demo-users.ts
-- which also populates public.profiles.
-- =====================================================

insert into public.hospitals (name, enrollment_code, city, state)
values
  ('Riverside Community Medical Center', 'RIVERSIDE', 'Jersey City', 'NJ'),
  ('St. Vincent Regional Hospital', 'STVINCENT', 'Newark', 'NJ')
on conflict (enrollment_code) do update
  set name = excluded.name, city = excluded.city, state = excluded.state;

-- Coordinators at Riverside. Insert-if-missing pattern using NOT EXISTS
-- keyed on the lower(email) partial unique index.
insert into public.coordinators (hospital_id, first_name, last_name, email, role)
select h.id, 'Sarah', 'Chen', 'sarah.chen@riverside.demo', 'care_coordinator'
from public.hospitals h
where h.enrollment_code = 'RIVERSIDE'
  and not exists (
    select 1 from public.coordinators c
    where lower(c.email) = 'sarah.chen@riverside.demo'
  );

insert into public.coordinators (hospital_id, first_name, last_name, email, role)
select h.id, 'Marcus', 'Johnson', 'marcus.johnson@riverside.demo', 'care_coordinator'
from public.hospitals h
where h.enrollment_code = 'RIVERSIDE'
  and not exists (
    select 1 from public.coordinators c
    where lower(c.email) = 'marcus.johnson@riverside.demo'
  );

insert into public.coordinators (hospital_id, first_name, last_name, email, role)
select h.id, 'Priya', 'Patel', 'priya.patel@riverside.demo', 'care_coordinator'
from public.hospitals h
where h.enrollment_code = 'RIVERSIDE'
  and not exists (
    select 1 from public.coordinators c
    where lower(c.email) = 'priya.patel@riverside.demo'
  );

insert into public.coordinators (hospital_id, first_name, last_name, email, role)
select h.id, 'Maya', 'Rodriguez', 'maya.rodriguez@riverside.demo', 'quality_director'
from public.hospitals h
where h.enrollment_code = 'RIVERSIDE'
  and not exists (
    select 1 from public.coordinators c
    where lower(c.email) = 'maya.rodriguez@riverside.demo'
  );
