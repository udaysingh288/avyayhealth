// Service-role Supabase client for edge functions.
// Uses the SUPABASE_SERVICE_ROLE_KEY env var which Supabase injects
// automatically into every deployed function.
//
// Never expose this client to a browser — it bypasses RLS entirely.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
