// enroll-patient
// =====================================================
// Creates a new patient row for a verified hospital enrollment and
// issues a short-lived session token for the patient PWA to use.
//
// POST /functions/v1/enroll-patient
// body:
//   {
//     hospital_code: string,    // e.g. "RIVERSIDE"
//     first_name: string,
//     dob: string,              // ISO date, YYYY-MM-DD
//     condition: "chf"|"copd"|"pneumonia"|"ami"
//   }
// returns:
//   {
//     patient_id, hospital_id, hospital_name, coordinator_first_name,
//     first_name, condition, discharge_date, days_in_program, total_days,
//     session_token
//   }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCorsPreflight, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { signPatientToken } from '../_shared/patientJwt.ts';

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  timing: string;
}

interface EnrollRequest {
  hospital_code: string;
  first_name: string;
  dob: string;
  condition: 'chf' | 'copd' | 'pneumonia' | 'ami';
  discharge_summary?: string;
  medications?: Medication[];
}

function isValidIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  let body: EnrollRequest;
  try {
    body = (await req.json()) as EnrollRequest;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const { hospital_code, first_name, dob, condition, discharge_summary, medications } = body;
  if (!hospital_code || !first_name || !dob || !condition) {
    return jsonResponse({ error: 'missing_fields' }, 400);
  }

  // Validate medications array structure if provided
  if (medications && !Array.isArray(medications)) {
    return jsonResponse({ error: 'invalid_medications', message: 'Must be an array' }, 400);
  }
  if (medications) {
    for (const med of medications) {
      if (!med.name || typeof med.name !== 'string') {
        return jsonResponse({ error: 'invalid_medication', message: 'Each medication must have a name' }, 400);
      }
    }
  }
  if (!isValidIsoDate(dob)) {
    return jsonResponse({ error: 'invalid_dob_format' }, 400);
  }
  if (!['chf', 'copd', 'pneumonia', 'ami'].includes(condition)) {
    return jsonResponse({ error: 'invalid_condition' }, 400);
  }

  // 1. Look up hospital by enrollment code
  const { data: hospital, error: hospitalErr } = await supabaseAdmin
    .from('hospitals')
    .select('id, name, enrollment_code')
    .eq('enrollment_code', hospital_code.toUpperCase())
    .maybeSingle();

  if (hospitalErr) {
    console.error('hospital lookup error', hospitalErr);
    return jsonResponse({ error: 'hospital_lookup_failed' }, 500);
  }
  if (!hospital) {
    return jsonResponse({ error: 'hospital_not_found' }, 404);
  }

  // 2. Pick a primary coordinator for this hospital (first care_coordinator)
  const { data: coordinator } = await supabaseAdmin
    .from('coordinators')
    .select('id, first_name')
    .eq('hospital_id', hospital.id)
    .eq('role', 'care_coordinator')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  // 3. Find or create the patient. We de-dupe on (hospital_id, first_name, dob)
  //    so re-enrolling the same person returns the existing row instead of
  //    creating a duplicate.
  const { data: existingPatient } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('hospital_id', hospital.id)
    .eq('first_name', first_name.trim())
    .eq('dob', dob)
    .maybeSingle();

  let patient = existingPatient;
  if (!patient) {
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('patients')
      .insert({
        hospital_id: hospital.id,
        coordinator_id: coordinator?.id ?? null,
        first_name: first_name.trim(),
        dob,
        condition,
        discharge_date: new Date().toISOString().slice(0, 10),
        days_in_program: 1,
        total_days: 30,
        status: 'active',
        discharge_summary: discharge_summary?.trim() || null,
        medications: medications ?? [],
      })
      .select('*')
      .single();
    if (insertErr || !inserted) {
      console.error('patient insert error', insertErr);
      return jsonResponse({ error: 'patient_insert_failed' }, 500);
    }
    patient = inserted;
  }

  // 4. Issue a session token
  const session_token = await signPatientToken({
    patient_id: patient.id,
    hospital_id: hospital.id,
  });

  return jsonResponse({
    patient_id: patient.id,
    hospital_id: hospital.id,
    hospital_name: hospital.name,
    coordinator_first_name: coordinator?.first_name ?? 'your care team',
    first_name: patient.first_name,
    condition: patient.condition,
    discharge_date: patient.discharge_date,
    days_in_program: patient.days_in_program,
    total_days: patient.total_days,
    medications: patient.medications ?? [],
    session_token,
  });
});
