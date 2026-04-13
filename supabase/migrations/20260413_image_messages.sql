-- Add image support to messages table for HIPAA-compliant photo upload + AI classification.
-- Images are stored in Supabase Storage (patient-images bucket) with signed URL access only.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image')),
  ADD COLUMN IF NOT EXISTS image_storage_path text,
  ADD COLUMN IF NOT EXISTS image_classification jsonb;

-- Audit log for HIPAA compliance: tracks every image upload, view, and classification event.
CREATE TABLE IF NOT EXISTS public.image_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_storage_path text NOT NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('uploaded', 'classified', 'viewed', 'deleted')),
  actor_type text NOT NULL CHECK (actor_type IN ('patient', 'coordinator', 'system')),
  actor_id text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_audit_patient ON public.image_audit_log (patient_id);
CREATE INDEX IF NOT EXISTS idx_image_audit_path ON public.image_audit_log (image_storage_path);

ALTER TABLE public.image_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinators view their hospital image audit logs"
  ON public.image_audit_log FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE hospital_id = public.current_hospital_id()
    )
  );

-- Track patient consent for image uploads
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS image_consent_given_at timestamptz;
