-- Direct messaging between patients and their care coordinators.
-- Separate from AI check-in conversations. Modeled after OhMD / TigerConnect / Spruce.

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  sender_type text not null check (sender_type in ('patient', 'coordinator')),
  sender_id text not null,             -- patient UUID or coordinator UUID
  content text not null,
  read_at timestamptz,                 -- null = unread by recipient
  created_at timestamptz not null default now()
);

create index if not exists idx_dm_patient on public.direct_messages (patient_id, created_at desc);
create index if not exists idx_dm_unread on public.direct_messages (patient_id, sender_type) where read_at is null;

-- RLS: coordinators can see messages for their hospital's patients
alter table public.direct_messages enable row level security;

create policy "Coordinators can view their hospital direct messages"
  on public.direct_messages for select
  to authenticated
  using (
    patient_id in (
      select id from public.patients
      where hospital_id = public.current_hospital_id()
    )
  );

create policy "Coordinators can insert direct messages"
  on public.direct_messages for insert
  to authenticated
  with check (
    sender_type = 'coordinator'
    and patient_id in (
      select id from public.patients
      where hospital_id = public.current_hospital_id()
    )
  );

create policy "Coordinators can update read_at"
  on public.direct_messages for update
  to authenticated
  using (
    patient_id in (
      select id from public.patients
      where hospital_id = public.current_hospital_id()
    )
  )
  with check (
    patient_id in (
      select id from public.patients
      where hospital_id = public.current_hospital_id()
    )
  );

-- Service role (edge functions) bypasses RLS for patient-side operations
