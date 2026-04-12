import { MOCK_SESSION } from '../utils/mockData';
import type { PatientSession, Condition } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Enrolls a patient via the `enroll-patient` edge function.
 *
 * The edge function holds the service role key and is the only
 * component permitted to insert into the `patients` table. The
 * client never touches the DB directly.
 *
 * Falls back to mock session when VITE_SUPABASE_URL is not configured
 * (useful for local dev without a Supabase project).
 */
export async function enrollPatient(params: {
  hospitalCode: string;
  firstName: string;
  dob: string;
  condition?: Condition;
}): Promise<PatientSession> {
  const { hospitalCode, firstName, dob, condition = 'chf' } = params;

  if (!hasSupabase) {
    return { ...MOCK_SESSION, first_name: firstName };
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/enroll-patient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      hospital_code: hospitalCode,
      first_name: firstName,
      dob,
      condition,
    }),
  });

  if (!res.ok) {
    let errMsg = 'enrollment_failed';
    try {
      const errBody = await res.json();
      errMsg = errBody.error ?? errMsg;
    } catch {
      /* ignore */
    }
    if (errMsg === 'hospital_not_found') {
      throw new Error(
        `Hospital "${hospitalCode}" not found. Please check your enrollment link.`,
      );
    }
    throw new Error(errMsg);
  }

  const data = (await res.json()) as {
    patient_id: string;
    hospital_id: string;
    hospital_name: string;
    coordinator_first_name: string;
    first_name: string;
    condition: Condition;
    discharge_date: string;
    days_in_program: number;
    total_days: number;
    session_token: string;
  };

  return {
    patient_id: data.patient_id,
    first_name: data.first_name,
    condition: data.condition,
    discharge_date: data.discharge_date,
    days_in_program: data.days_in_program,
    total_days: data.total_days,
    hospital_name: data.hospital_name,
    coordinator_first_name: data.coordinator_first_name,
    token: data.session_token,
  };
}
