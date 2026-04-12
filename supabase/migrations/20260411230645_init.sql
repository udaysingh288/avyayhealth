-- =====================================================
-- Avyay Health — initial schema
-- =====================================================
-- This migration is idempotent. It creates all core tables
-- used by the patient app, hospital dashboard, and quality
-- dashboard.
--
-- Tables:
--   hospitals        — one row per customer hospital
--   coordinators     — care team staff (denormalized, public-facing names)
--   patients         — enrolled patients
--   check_ins        — one row per day of the 30-day program
--   messages         — individual conversation messages inside a check-in
--   sdoh_flags       — social determinants of health flags raised per patient
--
-- RLS is enabled in migration 0003_rls.sql. Auth integration
-- (profiles + trigger) is in 0002_profiles.sql.
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================================================
-- hospitals
-- =====================================================
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enrollment_code text not null unique,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create index if not exists idx_hospitals_enrollment_code
  on public.hospitals (enrollment_code);

-- =====================================================
-- coordinators
-- =====================================================
create table if not exists public.coordinators (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role text not null default 'care_coordinator'
    check (role in ('care_coordinator', 'quality_director')),
  created_at timestamptz not null default now()
);

create index if not exists idx_coordinators_hospital
  on public.coordinators (hospital_id);
create unique index if not exists uq_coordinators_email
  on public.coordinators (lower(email)) where email is not null;

-- =====================================================
-- patients
-- =====================================================
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  coordinator_id uuid references public.coordinators(id) on delete set null,
  first_name text not null,
  last_name text,
  dob date,
  condition text not null check (condition in ('chf','copd','pneumonia','ami')),
  discharge_date date not null default current_date,
  days_in_program int not null default 1,
  total_days int not null default 30,
  phone text,
  enrollment_token text unique,
  status text not null default 'active'
    check (status in ('active','completed','withdrawn')),
  created_at timestamptz not null default now()
);

create index if not exists idx_patients_hospital on public.patients (hospital_id);
create index if not exists idx_patients_token on public.patients (enrollment_token);

-- =====================================================
-- check_ins
-- =====================================================
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  day_number int not null,
  date date not null default current_date,
  status text not null default 'pending'
    check (status in ('pending','completed','missed','escalated')),
  risk_level text check (risk_level in ('red','yellow','green')),
  summary text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_id, day_number)
);

create index if not exists idx_checkins_patient on public.check_ins (patient_id);
create index if not exists idx_checkins_status on public.check_ins (status);

-- =====================================================
-- messages
-- =====================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  role text not null check (role in ('ai','patient')),
  content text not null,
  risk_level text check (risk_level in ('red','yellow','green')),
  sent_at timestamptz not null default now()
);

create index if not exists idx_messages_checkin on public.messages (check_in_id);
create index if not exists idx_messages_sent_at on public.messages (sent_at);

-- =====================================================
-- sdoh_flags
-- =====================================================
create table if not exists public.sdoh_flags (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete set null,
  domain text not null check (domain in (
    'food_insecurity',
    'housing_instability',
    'transportation',
    'utility_difficulty',
    'interpersonal_safety'
  )),
  notes text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_sdoh_patient on public.sdoh_flags (patient_id);
