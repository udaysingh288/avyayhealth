/** Shared API client config for PatientAppPWA edge function calls. */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Build the full URL for a Supabase edge function. */
export function edgeFunctionUrl(fnName: string): string {
  return `${SUPABASE_URL}/functions/v1/${fnName}`;
}

/** Standard headers for authenticated patient API calls. */
export function patientHeaders(patientToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY!,
    'X-Patient-Token': patientToken,
  };
}

/** Standard headers for unauthenticated API calls (enrollment). */
export function anonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY!,
  };
}
