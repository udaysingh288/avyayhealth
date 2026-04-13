/**
 * get-image-url
 * =============
 * Returns a short-lived signed URL for a patient image.
 * Used by the iOS app to display images in chat (patients use custom JWTs,
 * not Supabase Auth, so they can't generate signed URLs directly).
 *
 * Coordinators on the Hospital Dashboard can use Supabase Auth + RLS
 * to generate signed URLs client-side — they don't need this function.
 *
 * POST /functions/v1/get-image-url
 * Headers:
 *   X-Patient-Token: <patient JWT>
 * Body:
 *   { "storage_path": "hospital_id/patient_id/uuid.jpg" }
 * Returns:
 *   { "url": "https://...", "expires_in": 300 }
 *
 * HIPAA: Signed URLs expire after 5 minutes. Each access is audit-logged.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { withPatientAuth } from '../_shared/withPatientAuth.ts';

const SIGNED_URL_TTL = 300; // 5 minutes

interface GetImageUrlRequest {
  storage_path: string;
}

Deno.serve(withPatientAuth<GetImageUrlRequest>(async ({ claims, body }) => {
  const { storage_path } = body;

  if (!storage_path || typeof storage_path !== 'string') {
    return jsonResponse({ error: 'missing_storage_path' }, 400);
  }

  // Security: verify the path belongs to this patient's hospital
  // Path format: {hospital_id}/{patient_id}/{uuid}.ext
  const pathParts = storage_path.split('/');
  if (pathParts.length < 3) {
    return jsonResponse({ error: 'invalid_storage_path' }, 400);
  }

  const pathHospitalId = pathParts[0];
  const pathPatientId = pathParts[1];

  if (pathHospitalId !== claims.hospital_id || pathPatientId !== claims.patient_id) {
    return jsonResponse({ error: 'access_denied' }, 403);
  }

  // Generate signed URL
  const { data, error } = await supabaseAdmin.storage
    .from('patient-images')
    .createSignedUrl(storage_path, SIGNED_URL_TTL);

  if (error || !data) {
    console.error('[get-image-url] signed URL error', error);
    return jsonResponse({ error: 'url_generation_failed' }, 500);
  }

  // Audit log
  await supabaseAdmin.from('image_audit_log').insert({
    image_storage_path: storage_path,
    patient_id: claims.patient_id,
    action: 'viewed',
    actor_type: 'patient',
    actor_id: claims.patient_id,
  });

  return jsonResponse({
    url: data.signedUrl,
    expires_in: SIGNED_URL_TTL,
  });
}));
