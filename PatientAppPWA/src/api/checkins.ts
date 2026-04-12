import type { Message, RiskLevel } from '../types';
import type { ConversationPhase } from '../engine';
import { hasSupabase, edgeFunctionUrl, patientHeaders } from './client';

/**
 * Persists a single message to today's check-in via the
 * `save-checkin-message` edge function.
 */
export async function saveMessage(params: {
  patientToken: string;
  message: Message;
}): Promise<void> {
  if (!hasSupabase) return;
  const { patientToken, message } = params;

  const res = await fetch(edgeFunctionUrl('save-checkin-message'), {
    method: 'POST',
    headers: patientHeaders(patientToken),
    body: JSON.stringify({
      role: message.role,
      content: message.content,
      risk_level: message.risk_level,
    }),
  });

  if (!res.ok) {
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

  const res = await fetch(edgeFunctionUrl('complete-checkin'), {
    method: 'POST',
    headers: patientHeaders(patientToken),
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

/**
 * Sends conversation to the AI chat-reply edge function.
 * Returns the AI response with risk classification and next phase.
 *
 * Returns null if the edge function is unavailable (offline, no API key, etc.)
 * — the caller should fall back to the local conversation engine.
 */
export interface ChatReplyResponse {
  reply: string;
  risk_level: RiskLevel;
  next_phase: ConversationPhase;
  is_complete: boolean;
  summary: string;
  follow_up: string | null;
}

export async function getChatReply(params: {
  patientToken: string;
  messages: { role: 'ai' | 'patient'; content: string }[];
  phase: ConversationPhase;
  dayNumber: number;
  condition: string;
  firstName: string;
  medications?: { name: string; dose: string; frequency: string; timing: string }[];
}): Promise<ChatReplyResponse | null> {
  if (!hasSupabase) return null;

  try {
    const res = await fetch(edgeFunctionUrl('chat-reply'), {
      method: 'POST',
      headers: patientHeaders(params.patientToken),
      body: JSON.stringify({
        messages: params.messages,
        phase: params.phase,
        day_number: params.dayNumber,
        condition: params.condition,
        first_name: params.firstName,
        medications: params.medications,
      }),
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('[checkins] chat-reply failed', res.status);
      return null;
    }

    const data = await res.json();
    return {
      reply: data.reply,
      risk_level: data.risk_level as RiskLevel,
      next_phase: data.next_phase as ConversationPhase,
      is_complete: data.is_complete,
      summary: data.summary,
      follow_up: data.follow_up ?? null,
    };
  } catch {
    // Network error — caller will use local engine
    return null;
  }
}
