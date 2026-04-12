-- Allow coordinators to manually override a patient's risk classification.
-- When set, the dashboard uses this value instead of deriving from the latest check-in.
-- Set to NULL to revert to AI-determined risk level.

alter table public.patients
  add column if not exists risk_override text
    check (risk_override in ('red', 'yellow', 'green'));
