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
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { withPatientAuth } from '../_shared/withPatientAuth.ts';

interface CompleteRequest {
  risk_level: 'red' | 'yellow' | 'green';
  summary: string;
}

Deno.serve(withPatientAuth<CompleteRequest>(async ({ claims, body }) => {
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
  let finalStatus = risk_level === 'red' ? 'escalated' : 'completed';

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
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('check_ins')
      .update({
        status: finalStatus,
        risk_level,
        summary,
        completed_at: new Date().toISOString(),
      })
      .eq('id', checkInId)
      .select('status')
      .single();
    if (updateErr || !updated) {
      console.error('check_in update error', updateErr);
      return jsonResponse({ error: 'checkin_update_failed' }, 500);
    }
    finalStatus = updated.status;
  }

  return jsonResponse({ check_in_id: checkInId, status: finalStatus });
}));
