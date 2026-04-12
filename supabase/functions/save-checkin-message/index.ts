// save-checkin-message
// =====================================================
// Appends a single message to today's check-in for an authenticated patient.
// Also ensures today's check-in row exists (creates it on first call of the day).
//
// Auth: bearer token is the patient session_token returned by enroll-patient.
//
// POST /functions/v1/save-checkin-message
// headers:
//   Authorization: Bearer <patient session token>
// body:
//   {
//     role: "ai" | "patient",
//     content: string,
//     risk_level?: "red" | "yellow" | "green"
//   }
// returns:
//   { check_in_id, message_id, day_number }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCorsPreflight, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { verifyPatientToken } from '../_shared/patientJwt.ts';

interface SaveMessageRequest {
  role: 'ai' | 'patient';
  content: string;
  risk_level?: 'red' | 'yellow' | 'green';
}

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  // Patient session token — note we look at a custom header because the
  // Supabase `Authorization: Bearer <supabase-jwt>` slot is also used by
  // the platform. We read `x-patient-token` to avoid collision.
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

  let body: SaveMessageRequest;
  try {
    body = (await req.json()) as SaveMessageRequest;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const { role, content, risk_level } = body;
  if (!role || !content) {
    return jsonResponse({ error: 'missing_fields' }, 400);
  }
  if (role !== 'ai' && role !== 'patient') {
    return jsonResponse({ error: 'invalid_role' }, 400);
  }
  if (risk_level && !['red', 'yellow', 'green'].includes(risk_level)) {
    return jsonResponse({ error: 'invalid_risk_level' }, 400);
  }

  // Load patient to get current day_number
  const { data: patient, error: patientErr } = await supabaseAdmin
    .from('patients')
    .select('id, days_in_program')
    .eq('id', claims.patient_id)
    .maybeSingle();

  if (patientErr || !patient) {
    return jsonResponse({ error: 'patient_not_found' }, 404);
  }

  const dayNumber = patient.days_in_program ?? 1;
  const today = new Date().toISOString().slice(0, 10);

  // Find or create today's check-in (unique per patient + day_number)
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
        date: today,
        status: 'pending',
      })
      .select('id')
      .single();
    if (insertErr || !inserted) {
      console.error('check_in insert error', insertErr);
      return jsonResponse({ error: 'checkin_create_failed' }, 500);
    }
    checkInId = inserted.id;
  }

  // Append the message
  const { data: msg, error: msgErr } = await supabaseAdmin
    .from('messages')
    .insert({
      check_in_id: checkInId,
      role,
      content,
      risk_level: risk_level ?? null,
    })
    .select('id')
    .single();

  if (msgErr || !msg) {
    console.error('message insert error', msgErr);
    return jsonResponse({ error: 'message_insert_failed' }, 500);
  }

  return jsonResponse({
    check_in_id: checkInId,
    message_id: msg.id,
    day_number: dayNumber,
  });
});
