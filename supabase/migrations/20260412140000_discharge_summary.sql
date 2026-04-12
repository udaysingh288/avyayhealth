-- =====================================================
-- Add discharge summary + medications to patients table.
--
-- discharge_summary: free-text clinical summary entered by
--   the enrolling nurse or imported from the ADT feed.
--   Stored as plain text — never surfaced raw to the patient.
--   Used by the AI conversation engine for clinical context.
--
-- medications: JSONB array of the patient's discharge medications.
--   Each element: { "name": "Lisinopril", "dose": "10 mg",
--                    "frequency": "Once daily", "timing": "With breakfast" }
--   Source of truth for medication check-in and CarePlan display.
-- =====================================================

alter table public.patients
  add column if not exists discharge_summary text,
  add column if not exists medications jsonb default '[]'::jsonb;

comment on column public.patients.discharge_summary is
  'Clinical discharge summary — used as AI context, never shown raw to patient';
comment on column public.patients.medications is
  'JSONB array of discharge medications [{name, dose, frequency, timing}]';
