import type { Message, RiskLevel } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

function authHeaders(patientToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
    'X-Patient-Token': patientToken,
  };
}

/**
 * Persists a single message to today's check-in via the
 * `save-checkin-message` edge function.
 *
 * The edge function ensures today's check-in row exists (creates
 * it on first call) and returns the check_in_id. We don't need to
 * track the check_in_id on the client — it's derived from the
 * patient JWT server-side.
 */
export async function saveMessage(params: {
  patientToken: string;
  message: Message;
}): Promise<void> {
  if (!hasSupabase) return;
  const { patientToken, message } = params;

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/save-checkin-message`,
    {
      method: 'POST',
      headers: authHeaders(patientToken),
      body: JSON.stringify({
        role: message.role,
        content: message.content,
        risk_level: message.risk_level,
      }),
    },
  );

  if (!res.ok) {
    // Swallow errors — the patient conversation should never crash
    // due to a persistence failure. Log for ops.
    // eslint-disable-next-line no-console
    console.warn('[checkins] save message failed', await res.text());
  }
}

export async function completeCheckIn(params: {
  patientToken: string;
  riskLevel: RiskLevel;
  summary: string;
}): Promise<void> {
  if (!hasSupabase) return;
  const { patientToken, riskLevel, summary } = params;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/complete-checkin`, {
    method: 'POST',
    headers: authHeaders(patientToken),
    body: JSON.stringify({
      risk_level: riskLevel,
      summary,
    }),
  });

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn('[checkins] complete check-in failed', await res.text());
  }
}
