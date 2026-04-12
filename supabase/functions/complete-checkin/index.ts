// complete-checkin
// =====================================================
// Marks today's check-in as completed with a final risk level and summary.
// Also raises an 'escalated' status if risk_level is 'red'.
//
// Auth: bearer token is the patient session_token returned by enroll-patient.
//
// POST /functions/v1/complete-checkin
// headers:
//   X-Patient-Token: <patient session token>
// body:
//   {
//     risk_level: "red" | "yellow" | "green",
//     summary: string
//   }
// returns:
//   { check_in_id, status }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCorsPreflight, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { verifyPatientToken } from '../_shared/patientJwt.ts';

interface CompleteRequest {
  risk_level: 'red' | 'yellow' | 'green';
  summary: string;
}

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const patientToken =
    req.headers.get('x-patient-token') ??
    req.headers.get('X-Patient-Token') ??
    '';
  if (!patientToken) {
    return jsonResponse({ error: 'missing_patient_token' }, 401);
  }

  let claims;
  try {
    claims = await verifyPatientToken(patientToken);
  } catch (err) {
    console.error('patient token verify failed', err);
    return jsonResponse({ error: 'invalid_patient_token' }, 401);
  }

  let body: CompleteRequest;
  try {
    body = (await req.json()) as CompleteRequest;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const { risk_level, summary } = body;
  if (!risk_level || !summary) {
    return jsonResponse({ error: 'missing_fields' }, 400);
  }
  if (!['red', 'yellow', 'green'].includes(risk_level)) {
    return jsonResponse({ error: 'invalid_risk_level' }, 400);
  }

  // Load patient for day_number
  const { data: patient, error: patientErr } = await supabaseAdmin
    .from('patients')
    .select('id, days_in_program')
    .eq('id', claims.patient_id)
    .maybeSingle();

  if (patientErr || !patient) {
    return jsonResponse({ error: 'patient_not_found' }, 404);
  }

  const dayNumber = patient.days_in_program ?? 1;
  const finalStatus = risk_level === 'red' ? 'escalated' : 'completed';

  // Upsert today's check-in to completed (create it if somehow still missing)
  const { data: existing } = await supabaseAdmin
    .from('check_ins')
    .select('id')
    .eq('patient_id', patient.id)
    .eq('day_number', dayNumber)
    .maybeSingle();

  let checkInId = existing?.id;
  if (!checkInId) {
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('check_ins')
      .insert({
        patient_id: patient.id,
        day_number: dayNumber,
        date: new Date().toISOString().slice(0, 10),
        status: finalStatus,
        risk_level,
        summary,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (insertErr || !inserted) {
      console.error('check_in insert error', insertErr);
      return jsonResponse({ error: 'checkin_create_failed' }, 500);
    }
    checkInId = inserted.id;
  } else {
    const { error: updateErr } = await supabaseAdmin
      .from('check_ins')
      .update({
        status: finalStatus,
        risk_level,
        summary,
        completed_at: new Date().toISOString(),
      })
      .eq('id', checkInId);
    if (updateErr) {
      console.error('check_in update error', updateErr);
      return jsonResponse({ error: 'checkin_update_failed' }, 500);
    }
  }

  return jsonResponse({ check_in_id: checkInId, status: finalStatus });
});
