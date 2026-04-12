// POST /functions/v1/send-message
// Patient sends a direct message to their care coordinator.
// Auth: x-patient-token header (patient JWT)
// Body: { content: string }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { withPatientAuth } from '../_shared/withPatientAuth.ts';
import { jsonResponse } from '../_shared/cors.ts';

interface SendMessageBody {
  content: string;
}

Deno.serve(
  withPatientAuth<SendMessageBody>(async ({ claims, body }) => {
    const { content } = body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return jsonResponse({ error: 'content_required' }, 400);
    }
    if (content.length > 2000) {
      return jsonResponse({ error: 'content_too_long' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        patient_id: claims.patient_id,
        sender_type: 'patient',
        sender_id: claims.patient_id,
        content: content.trim(),
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('insert direct_message failed', error);
      return jsonResponse({ error: 'send_failed' }, 500);
    }

    return jsonResponse({
      message_id: data.id,
      created_at: data.created_at,
    });
  }),
);
