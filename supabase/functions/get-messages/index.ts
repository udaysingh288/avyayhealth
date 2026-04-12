// POST /functions/v1/get-messages
// Patient fetches their direct message thread.
// Auth: x-patient-token header (patient JWT)
// Body: { limit?: number, before?: string }
// Also marks coordinator messages as read.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { withPatientAuth } from '../_shared/withPatientAuth.ts';
import { jsonResponse } from '../_shared/cors.ts';

interface GetMessagesBody {
  limit?: number;
  before?: string; // ISO timestamp for pagination
}

Deno.serve(
  withPatientAuth<GetMessagesBody>(async ({ claims, body }) => {
    const limit = Math.min(body.limit ?? 50, 100);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch messages
    let query = supabase
      .from('direct_messages')
      .select('id, sender_type, sender_id, content, read_at, created_at')
      .eq('patient_id', claims.patient_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (body.before) {
      query = query.lt('created_at', body.before);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('fetch direct_messages failed', error);
      return jsonResponse({ error: 'fetch_failed' }, 500);
    }

    // Mark unread coordinator messages as read
    const unreadIds = (messages ?? [])
      .filter((m) => m.sender_type === 'coordinator' && !m.read_at)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);
    }

    return jsonResponse({
      messages: (messages ?? []).reverse(), // oldest first
    });
  }),
);
