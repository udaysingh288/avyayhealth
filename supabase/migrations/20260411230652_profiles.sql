-- =====================================================
-- Avyay Health — auth profiles
-- =====================================================
-- Links Supabase Auth users to a hospital and a role.
-- Every row in auth.users has exactly one row in public.profiles.
--
-- A profile's hospital_id is what RLS uses to scope data access
-- for authenticated clients (care coordinators, quality directors).
-- =====================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete set null,
  coordinator_id uuid references public.coordinators(id) on delete set null,
  role text not null default 'care_coordinator'
    check (role in ('care_coordinator','quality_director','admin')),
  display_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_hospital on public.profiles (hospital_id);

-- =====================================================
-- Auto-create a profile row whenever a Supabase Auth user is created.
-- hospital_id / role / display_name are pulled from raw_user_meta_data
-- at signup time (we set these when creating users via the admin API).
-- =====================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, hospital_id, role, display_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'hospital_id','')::uuid,
    coalesce(new.raw_user_meta_data ->> 'role','care_coordinator'),
    new.raw_user_meta_data ->> 'display_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- =====================================================
-- Helper functions used by RLS policies in 0003_rls.sql
-- =====================================================
create or replace function public.current_hospital_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select hospital_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;
