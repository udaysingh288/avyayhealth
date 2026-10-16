/**
 * chat-reply
 * ==========
 * AI-powered conversational check-in for post-discharge patients.
 *
 * Takes the full conversation history + patient context, sends it to
 * Claude (Anthropic API) with a clinical system prompt and RAG knowledge,
 * and returns a structured response with risk classification.
 *
 * Falls back to a simpler local response if no ANTHROPIC_API_KEY is set.
 *
 * POST /functions/v1/chat-reply
 * Headers:
 *   X-Patient-Token: <patient JWT>
 *   Authorization: Bearer <supabase anon key>
 * Body:
 *   {
 *     messages: [{ role: "ai"|"patient", content: string }],
 *     phase: "symptom_check"|"symptom_followup"|"medication_check"|"sdoh_screen",
 *     day_number: number,
 *     condition: string,
 *     first_name: string
 *   }
 * Returns:
 *   {
 *     reply: string,
 *     risk_level: "green"|"yellow"|"red",
 *     phase: string,         // next conversation phase
 *     is_complete: boolean,   // should the check-in end?
 *     summary: string,        // clinical summary for coordinator dashboard
 *     follow_up: string|null  // optional second message (e.g. medication question)
 *   }
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { jsonResponse } from '../_shared/cors.ts';
import { withPatientAuth } from '../_shared/withPatientAuth.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const VALID_PHASES = ['symptom_check', 'symptom_followup', 'medication_check', 'sdoh_screen', 'complete'] as const;
const VALID_CONDITIONS = ['chf', 'copd', 'pneumonia', 'ami', 'hip_knee', 'cabg'] as const;

// ─── Clinical knowledge base (RAG-in-prompt) ───────────────────────
// This replaces a vector DB for now. The clinical protocols are compact
// enough to fit in the system prompt (~2K tokens). When the knowledge
// base grows (e.g. hundreds of conditions, drug interactions), migrate
// to pgvector + embedding search.

const CLINICAL_KNOWLEDGE = `
## Post-Discharge Clinical Protocols

### Heart Failure (CHF) — Red Flags
- Sudden weight gain: >2 lbs in 24 hours or >5 lbs in a week
- New or worsening swelling in feet, ankles, legs, or abdomen
- Shortness of breath at rest or when lying flat (orthopnea)
- Waking up at night gasping for air (paroxysmal nocturnal dyspnea)
- New or worsening cough, especially if producing pink/frothy sputum
- Persistent dizziness or lightheadedness
- Severe fatigue — unable to perform daily activities

### CHF — Self-Care Guidance
- Weigh yourself every morning, same time, same scale
- Limit sodium to <2000mg/day
- Follow fluid restrictions if prescribed
- Take medications exactly as prescribed — especially diuretics, ACE inhibitors, beta-blockers
- Elevate feet when sitting
- Report any 2lb weight gain in 24hrs to care team immediately

### COPD — Red Flags
- Significantly increased breathlessness compared to baseline
- Change in sputum color to green, yellow, or brown
- Increased sputum volume
- Chest tightness that doesn't improve with rescue inhaler
- Fever >101.5°F
- Confusion or extreme drowsiness
- Blue lips or fingertips (cyanosis)

### COPD — Self-Care Guidance
- Use rescue inhaler as directed (typically albuterol)
- Practice pursed-lip breathing when short of breath
- Keep using maintenance inhalers even when feeling well
- Avoid smoke, dust, strong fumes
- Stay active within prescribed limits
- Annual flu shot, pneumonia vaccine

### Pneumonia — Red Flags
- High fever >102°F that doesn't respond to medication
- Severe difficulty breathing
- Chest pain that worsens with breathing
- Coughing up blood
- Confusion or altered mental status
- Bluish skin color

### AMI (Heart Attack) Recovery — Red Flags
- Return of chest pain, pressure, or tightness
- Pain radiating to arm, jaw, neck, or back
- Shortness of breath
- Cold sweat, nausea, lightheadedness
- Irregular or rapid heartbeat
- Fainting or near-fainting

### SDOH (Social Determinants of Health) — CMS 5-Domain Screening
Screen on days 3, 7, 14, 21, 28:
1. Transportation — ability to get to follow-up appointments
2. Food insecurity — access to adequate healthy food
3. Housing instability — stable living situation for recovery
4. Utility difficulty — heat, electricity, water access
5. Interpersonal safety — feeling safe at home

### When to Direct Patient to Call 911
ALWAYS escalate to 911 if patient reports:
- Cannot breathe / severe breathing difficulty
- Chest pain (especially if new or worsening)
- Blue lips or fingertips
- Fainting / loss of consciousness
- Severe confusion / inability to speak
- Coughing up blood
- Signs of stroke (face drooping, arm weakness, speech difficulty)

### Medication Adherence
Common barriers to address:
- Forgetting (offer reminder strategies)
- Cost/access (flag for coordinator to arrange assistance)
- Side effects (note and flag — never advise stopping medication)
- Confusion about which medication to take when (simplify, flag for coordinator)
- Running out / need refill (flag urgently for coordinator)

IMPORTANT: Never advise a patient to stop or change their medication. Only their doctor can do that.
`;

// ─── System prompt ─────────────────────────────────────────────────

function buildSystemPrompt(
  firstName: string,
  condition: string,
  dayNumber: number,
  phase: string,
  dischargeSummary?: string,
  medications?: Medication[],
): string {
  const conditionLabel: Record<string, string> = {
    chf: 'Heart Failure (CHF)',
    copd: 'COPD',
    pneumonia: 'Pneumonia',
    ami: 'AMI (Heart Attack Recovery)',
  };

  const sdohDays = [3, 7, 14, 21, 28];
  const isSdohDay = sdohDays.includes(dayNumber);
  const sdohDomains = ['transportation', 'food_insecurity', 'housing_instability', 'utility_difficulty', 'interpersonal_safety'];
  const sdohDomain = isSdohDay ? sdohDomains[sdohDays.indexOf(dayNumber)] ?? null : null;

  return `You are Avyay Health's AI care companion — a warm, empathetic post-discharge health check-in assistant. You are checking in on ${firstName}, a patient recovering from ${conditionLabel[condition] ?? condition}.

## Your Identity
- You represent Avyay Health — a caring health companion, NOT a doctor
- You are warm, conversational, and human — like a kind nurse friend
- You use the patient's first name naturally
- You keep responses concise (2-4 sentences) — patients are often elderly and tired
- You NEVER use medical jargon without explanation
- You NEVER diagnose or prescribe — you flag concerns for the care team

## Current Context
- Patient: ${firstName}
- Condition: ${conditionLabel[condition] ?? condition}
- Recovery day: ${dayNumber} of 30
- Current conversation phase: ${phase}
${isSdohDay ? `- TODAY IS AN SDOH SCREENING DAY — after symptoms and medications, ask about: ${sdohDomain?.replace(/_/g, ' ')}` : ''}
${dischargeSummary ? `
## Discharge Summary (CONFIDENTIAL — never read this verbatim to the patient)
${dischargeSummary}
Use this to understand the patient's clinical context, but NEVER quote it directly. Refer to specifics naturally, e.g. "How is the swelling in your ankles?" not "Per your discharge summary..."
` : ''}
${medications && medications.length > 0 ? `
## Patient's Discharge Medications
${medications.map((m) => `- ${m.name} ${m.dose} — ${m.frequency}${m.timing ? ` (${m.timing})` : ''}`).join('\n')}

IMPORTANT medication check instructions:
- When asking about medications, reference the SPECIFIC medications above by name
- If the patient says "yes" or "I took them", confirm which ones: "Great — so you took your ${medications.map(m => m.name).join(', ')}?"
- If the patient says "some" or is vague, ask which specific ones they took or missed
- If the patient mentions a medication NOT on this list, note it for the coordinator
- Never advise stopping or changing any medication
` : ''}

## Conversation Flow
The check-in follows this protocol:
1. **Symptom check** — Ask how they're feeling. Respond to whatever they say.
2. **Symptom follow-up** — If they report symptoms, ask one relevant follow-up. If positive, acknowledge warmly.
3. **Medication check** — Ask if they've taken their medications today.
${isSdohDay ? `4. **SDOH screen** — Ask about ${sdohDomain?.replace(/_/g, ' ')}.` : ''}
5. **Completion** — Thank them, encourage them, tell them you'll check in tomorrow.

## How to Handle Different Inputs

### Normal health responses
Respond naturally and empathetically. Use the clinical knowledge below to ask relevant follow-up questions.

### Vague or short responses ("ok", "fine", "meh", "so so")
Gently probe: "I'm glad to hear you're hanging in there. Any specific symptoms — like trouble breathing, swelling, or pain?"

### Random words, gibberish, or off-topic input
Warmly acknowledge and redirect: "Thanks for your message, ${firstName}! For today's check-in, I want to make sure you're doing well — how's your body feeling?"

### Life updates ("my daughter visited", "went to the store")
Respond warmly to the life update FIRST, then gently steer to health: "That sounds lovely! And how are you feeling physically today?"

### Emotional messages (scared, lonely, anxious)
Validate FIRST. Never dismiss. Note it for the care team: "It's completely normal to feel that way during recovery. You're not alone — your care team is here for you."

### Questions from the patient
Answer if you can from the clinical knowledge. If not, say you'll flag it for their coordinator. NEVER make up medical advice.

### Frustration with the app/check-ins
Acknowledge their frustration. Explain briefly why daily check-ins matter. Keep it short.

### Emojis, single characters, nonsense
Treat as "unclear" — acknowledge warmly and ask a simple, direct question.

## Risk Classification Rules
You MUST classify every response:
- **GREEN**: Patient is stable, no concerning symptoms, medications taken
- **YELLOW**: Mild-to-moderate symptoms present, missed medications, emotional distress, SDOH concerns — coordinator should be aware
- **RED**: Emergency symptoms — direct patient to call 911 IMMEDIATELY before saying anything else

## Response Format
Respond with ONLY a JSON object (no markdown, no code fences):
{
  "reply": "Your warm, conversational response",
  "risk_level": "green|yellow|red",
  "next_phase": "symptom_check|symptom_followup|medication_check|sdoh_screen|complete",
  "is_complete": false,
  "summary": "Brief clinical note for coordinator (e.g. 'Reports mild ankle swelling, day 5 CHF. Medications taken.')",
  "follow_up": "Optional second message, like a medication question. null if not needed."
}

## Clinical Knowledge Base
${CLINICAL_KNOWLEDGE}

CRITICAL RULES:
- Never claim the care team has been notified or contacted. This endpoint only generates a response; it does not deliver notifications.
- NEVER tell the patient their risk level. They see "Thank you" not "You are classified Yellow."
- NEVER advise stopping or changing medication.
- For RED symptoms: first sentence MUST be "Please call 911" or "Please go to the emergency room immediately."
- Keep replies under 280 characters when possible. Patients are elderly.
- Always set is_complete=true when the check-in should end (after meds or SDOH).
- Always include a clinical summary — coordinators depend on it.`;
}

// ─── Call Anthropic Claude API ──────────────────────────────────────

interface ChatMessage {
  role: 'ai' | 'patient';
  content: string;
}

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  timing: string;
}

interface ChatReplyRequest {
  messages: ChatMessage[];
  phase: string;
  day_number: number;
  condition: string;
  first_name: string;
  discharge_summary?: string;
  medications?: Medication[];
}

interface AIResponse {
  reply: string;
  risk_level: 'green' | 'yellow' | 'red';
  next_phase: string;
  is_complete: boolean;
  summary: string;
  follow_up: string | null;
}

async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<AIResponse> {
  // Convert our messages to Anthropic format
  const anthropicMessages = messages.map((m) => ({
    role: m.role === 'patient' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('[chat-reply] Claude API error:', response.status, err);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text ?? '';

  // Parse JSON from Claude's response
  try {
    // Strip any markdown code fences if present
    const cleaned = rawText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AIResponse;

    // Validate required fields
    if (!parsed.reply || !parsed.risk_level || !parsed.next_phase) {
      throw new Error('Missing required fields in AI response');
    }

    return parsed;
  } catch (parseErr) {
    console.error('[chat-reply] Failed to parse Claude response:', rawText);
    // Return the raw text as a reply with safe defaults
    return {
      reply: rawText.slice(0, 500) || "Thank you for your message. How are you feeling today?",
      risk_level: 'green',
      next_phase: 'symptom_followup',
      is_complete: false,
      summary: 'AI response parse error — manual review recommended',
      follow_up: null,
    };
  }
}

// ─── Fallback: simple rule-based response when no API key ──────────

function fallbackResponse(
  messages: ChatMessage[],
  firstName: string,
  phase: string,
  medications?: Medication[],
): AIResponse {
  const lastPatient = [...messages].reverse().find((m) => m.role === 'patient');
  const text = lastPatient?.content?.toLowerCase() ?? '';

  // Emergency detection
  const emergencyPatterns = [
    /can'?t\s*breathe/i, /chest\s*pain/i, /blue\s*(lips|fingers)/i,
    /passed?\s*out/i, /heart\s*attack/i, /\b911\b/, /dying/i,
  ];
  if (emergencyPatterns.some((p) => p.test(text))) {
    return {
      reply: `${firstName}, this sounds serious. Please call 911 or go to your nearest emergency room right away. Please contact your care team directly.`,
      risk_level: 'red',
      next_phase: 'complete',
      is_complete: true,
      summary: `URGENT: Patient reports emergency symptoms: "${text.slice(0, 100)}"`,
      follow_up: null,
    };
  }

  // Phase-based responses
  const medNames = medications && medications.length > 0
    ? medications.map((m) => m.name).join(', ')
    : null;
  const medQuestion = medNames
    ? `Have you been able to take your medications today? That includes your ${medNames}.`
    : 'Have you been able to take all your medications today?';

  if (phase === 'symptom_check' || phase === 'symptom_followup') {
    const hasSymptom = /breath|swell|pain|cough|dizz|fever|tired|weak|worse|bad|not good|terrible/i.test(text);
    if (hasSymptom) {
      return {
        reply: `Thank you for telling me about that, ${firstName}. I've noted this for your care coordinator so they can follow up with you. Please rest and let me know if anything gets worse.`,
        risk_level: 'yellow',
        next_phase: 'medication_check',
        is_complete: false,
        summary: `Reports symptoms: "${text.slice(0, 100)}"`,
        follow_up: medQuestion,
      };
    }
    return {
      reply: `That's good to hear, ${firstName}. I'm glad you're doing well today.`,
      risk_level: 'green',
      next_phase: 'medication_check',
      is_complete: false,
      summary: 'Patient reports feeling well',
      follow_up: medQuestion,
    };
  }

  if (phase === 'medication_check') {
    const missed = /miss|forgot|skip|no|haven|didn/i.test(text);
    if (missed) {
      return {
        reply: `Thank you for being honest, ${firstName}. Missing a dose happens, but try to get back on schedule. I've noted this for your coordinator.`,
        risk_level: 'yellow',
        next_phase: 'complete',
        is_complete: true,
        summary: 'Missed medication doses today',
        follow_up: `That's everything for today, ${firstName}. Take care and I'll check in again tomorrow.`,
      };
    }
    return {
      reply: `Great job staying on top of your medications, ${firstName}!`,
      risk_level: 'green',
      next_phase: 'complete',
      is_complete: true,
      summary: 'Medications taken as prescribed',
      follow_up: `That's everything for today, ${firstName}. You're doing great — see you tomorrow!`,
    };
  }

  // Default
  return {
    reply: `Thank you, ${firstName}. Your check-in is all set for today. Take care!`,
    risk_level: 'green',
    next_phase: 'complete',
    is_complete: true,
    summary: 'Check-in completed',
    follow_up: null,
  };
}

// ─── Input validation helpers ─────────────────────────────────────

function isValidMessage(m: unknown): m is ChatMessage {
  return (
    typeof m === 'object' && m !== null &&
    'role' in m && 'content' in m &&
    ((m as ChatMessage).role === 'ai' || (m as ChatMessage).role === 'patient') &&
    typeof (m as ChatMessage).content === 'string'
  );
}

// ─── Main handler ──────────────────────────────────────────────────

Deno.serve(withPatientAuth<ChatReplyRequest>(async ({ body }) => {
  const { messages, phase, day_number, condition, first_name, discharge_summary, medications } = body;

  // Validate required fields exist
  if (!messages || !phase || !day_number || !condition || !first_name) {
    return jsonResponse({ error: 'missing_fields' }, 400);
  }

  // Validate phase is a known value
  if (!(VALID_PHASES as readonly string[]).includes(phase)) {
    return jsonResponse({ error: 'invalid_phase', valid: VALID_PHASES }, 400);
  }

  // Validate condition is a known value
  if (!(VALID_CONDITIONS as readonly string[]).includes(condition)) {
    return jsonResponse({ error: 'invalid_condition', valid: VALID_CONDITIONS }, 400);
  }

  // Validate day_number is a reasonable number
  if (typeof day_number !== 'number' || day_number < 1 || day_number > 30) {
    return jsonResponse({ error: 'invalid_day_number', message: 'Must be 1-30' }, 400);
  }

  // Validate messages is an array with correct structure
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: 'invalid_messages', message: 'Must be a non-empty array' }, 400);
  }
  if (!messages.every(isValidMessage)) {
    return jsonResponse({ error: 'invalid_messages', message: 'Each message must have role ("ai"|"patient") and content (string)' }, 400);
  }

  // Validate first_name is a non-empty string
  if (typeof first_name !== 'string' || first_name.trim().length === 0) {
    return jsonResponse({ error: 'invalid_first_name' }, 400);
  }

  let result: AIResponse;

  if (ANTHROPIC_API_KEY) {
    try {
      const systemPrompt = buildSystemPrompt(first_name, condition, day_number, phase, discharge_summary, medications);
      result = await callClaude(systemPrompt, messages);
    } catch (err) {
      console.error('[chat-reply] Claude call failed, using fallback:', err);
      result = fallbackResponse(messages, first_name, phase, medications);
    }
  } else {
    // No API key — use rule-based fallback
    result = fallbackResponse(messages, first_name, phase);
  }

  return jsonResponse(result);
}));
