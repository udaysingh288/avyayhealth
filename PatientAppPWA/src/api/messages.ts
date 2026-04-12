/** Direct messaging API calls for patient ↔ coordinator chat. */

import { hasSupabase, edgeFunctionUrl, patientHeaders } from './client';

export interface DirectMessage {
  id: string;
  sender_type: 'patient' | 'coordinator';
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

/** Fetch the message thread for the current patient. */
export async function getMessages(params: {
  patientToken: string;
  limit?: number;
  before?: string;
}): Promise<DirectMessage[]> {
  if (!hasSupabase) return [];

  const res = await fetch(edgeFunctionUrl('get-messages'), {
    method: 'POST',
    headers: patientHeaders(params.patientToken),
    body: JSON.stringify({
      limit: params.limit ?? 50,
      before: params.before,
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.messages ?? [];
}

/** Send a direct message to the patient's care coordinator. */
export async function sendDirectMessage(params: {
  patientToken: string;
  content: string;
}): Promise<{ message_id: string; created_at: string } | null> {
  if (!hasSupabase) return null;

  const res = await fetch(edgeFunctionUrl('send-message'), {
    method: 'POST',
    headers: patientHeaders(params.patientToken),
    body: JSON.stringify({ content: params.content }),
  });

  if (!res.ok) return null;
  return res.json();
}
