/**
 * Intent classification for patient messages.
 *
 * Classifies the INTENT of what the patient is saying, detects symptoms,
 * and determines severity. Uses pattern matching — no external API calls.
 */

import { EMERGENCY_PATTERNS, SYMPTOM_RULES } from '@shared/constants/clinical';
import type { Intent, SymptomType, ClassificationResult } from './types';

// ─── Intent patterns ──────────────────────────────────────────────

const POSITIVE_PATTERNS = [
  /\b(good|great|fine|well|better|okay|ok|alright|wonderful|excellent|fantastic|amazing|lovely)\b/i,
  /feeling\s*(good|great|fine|better|ok|alright|much\s*better)/i,
  /doing\s*(good|great|fine|well|better|ok|alright)/i,
  /no\s*(pain|issue|problem|complaint|concern|symptom)/i,
  /i'?m\s*(good|fine|ok|great|well|better|alright)/i,
  /all\s*(good|fine|ok|taken|clear)/i,
  /much\s*better/i, /improving/i, /on\s*the\s*mend/i,
  /feeling\s*strong/i, /getting\s*better/i,
  /went\s*(for\s*)?(a\s*)?(walk|stroll)/i, /walked/i,
  /exercis/i, /active/i,
  /👍|😊|🙂|😀|💪|❤️|🥰|😁/,
];

const NEGATIVE_FEELING_PATTERNS = [
  /not\s*(good|great|well|ok|fine|feeling)/i,
  /\b(bad|terrible|awful|horrible|rough|lousy|miserable|crappy|worst|struggling)\b/i,
  /feel(ing)?\s*(bad|terrible|awful|worse|rough|lousy|down|low|off|sick|unwell)/i,
  /not\s*(doing|feeling)\s*(well|good|great|ok)/i,
  /been\s*better/i, /worse\s*than/i, /not\s*myself/i,
  /having\s*a\s*(hard|tough|rough|bad|difficult)\s*(time|day)/i,
  /😢|😞|😔|😥|😰|😩|🤒|🤕|😣/,
];

const EMOTIONAL_PATTERNS = [
  /\b(scared|afraid|anxious|worried|nervous|terrified|panick|lonely|alone|depress|sad|crying|miss|overwhelm)\b/i,
  /i'?m\s*(scared|worried|anxious|afraid|nervous|lonely|sad)/i,
  /feel(ing)?\s*(scared|worried|anxious|afraid|nervous|lonely|alone|sad|depressed|overwhelmed|hopeless)/i,
  /no\s*one\s*(is\s*)?here/i, /by\s*myself/i, /all\s*alone/i,
  /miss\s*(my|the)\s*(wife|husband|family|home|dog|cat)/i,
  /don'?t\s*know\s*(if|what|how|why)/i,
  /what\s*if\s*(i|it|something)/i,
  /😢|😭|😰|🥺|💔/,
];

const QUESTION_PATTERNS = [
  /\?\s*$/,
  /^(can|should|what|when|how|why|is|are|do|does|will|would|could|where)\s/i,
  /is\s+(that|it|this)\s+(ok|normal|fine|bad|good|right)/i,
  /what\s+should\s+i/i,
  /supposed\s+to/i,
];

const GREETING_PATTERNS = [
  /^(hi|hey|hello|good\s*(morning|afternoon|evening)|howdy|yo|sup)\s*[!.,]?\s*$/i,
  /^(hi|hey|hello)\s/i,
];

const FRUSTRATION_PATTERNS = [
  /stop\s*(asking|texting|messaging|bothering)/i,
  /leave\s*me\s*alone/i,
  /don'?t\s*(want|need|care|bother)/i,
  /annoying/i, /this\s*is\s*stupid/i, /waste\s*of\s*time/i,
  /go\s*away/i, /shut\s*up/i, /stop\s*it/i,
  /hate\s*this/i, /unsubscribe/i,
];

const GOODBYE_PATTERNS = [
  /\b(bye|goodbye|good\s*night|take\s*care|see\s*you|talk\s*(later|tomorrow)|ttyl|night)\b/i,
  /\bthanks?\b/i, /\bthank\s*you\b/i, /\bty\b/i,
];

const LIFE_UPDATE_PATTERNS = [
  /\b(daughter|son|wife|husband|kid|grandchild|friend|neighbor|church|grocery|cook|garden|tv|movie|book|read|visit|walked|drove|shopp|clean|laundry)\b/i,
  /my\s+(daughter|son|wife|husband|family|friend|neighbor|doc)/i,
  /went\s+to\s+(the\s+)?(store|church|doctor|park|hospital|pharmacy|bank)/i,
  /ate\s+(a|some|my)\b/i, /made\s+(dinner|lunch|breakfast|food|soup)/i,
  /watch(ed|ing)\s+(a|the|some)\b/i,
];

const MED_YES_PATTERNS = [
  /\b(yes|yeah|yep|yea|yup|sure|definitely|absolutely|of\s*course)\b/i,
  /all\s*taken/i, /took\s*(them|it|all|my|every)/i, /taking\s*(them|it|my)/i,
  /on\s*schedule/i, /haven'?t\s*missed/i, /every\s*(day|morning|night|dose)/i,
  /👍|✅/,
];

const MED_NO_PATTERNS = [
  /miss(ed|ing)?/i, /forgot/i, /skip(ped|ping)?/i,
  /didn'?t\s*(take|remember)/i, /haven'?t\s*(taken|had)/i,
  /not\s*(yet|today|sure|taken)/i,
];

const MED_ISSUE_PATTERNS = [
  /refill/i, /ran\s*out/i, /run(ning)?\s*out/i, /pharmacy/i, /prescription/i,
  /side\s*effect/i, /makes?\s*me\s*(sick|nauseous|dizzy|tired)/i,
  /too\s*(many|much|expensive|confusing)/i, /which\s*(one|pill|med)/i,
  /cost/i, /afford/i, /expensive/i,
  /don'?t\s*(understand|know)\s*(which|what|how)/i,
];

const AFFIRMATIVE_PATTERNS = [
  /^(yes|yeah|yep|yea|yup|ok|okay|sure|right|correct|exactly|definitely|absolutely|mhm|uh\s*huh)\s*[.!]?\s*$/i,
  /^(y|ye|ya|si)\s*$/i,
  /^👍\s*$/, /^✅\s*$/, /^👌\s*$/,
];

const NEGATIVE_SHORT_PATTERNS = [
  /^(no|nah|nope|nuh\s*uh|negative|not\s*really)\s*[.!]?\s*$/i,
  /^(n)\s*$/i,
  /^👎\s*$/,
];

// ─── Classification ───────────────────────────────────────────────

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text));
}

export function classify(text: string): ClassificationResult {
  const raw = text.trim();
  const lower = raw.toLowerCase();

  // Default result
  const result: ClassificationResult = {
    intent: 'unclear',
    symptoms: [],
    severity: 'green',
    sentiment: 'neutral',
    raw,
  };

  // Empty or very short
  if (lower.length < 2) return result;

  // 1. Emergency check first — highest priority
  if (EMERGENCY_PATTERNS.some(p => p.test(raw))) {
    result.intent = 'emergency';
    result.severity = 'red';
    result.sentiment = 'negative';
    return result;
  }

  // 2. Check for specific symptoms
  const detectedSymptoms: SymptomType[] = [];
  let maxSeverity: 'green' | 'yellow' = 'green';

  for (const rule of SYMPTOM_RULES) {
    if (rule.pattern.test(raw) && !detectedSymptoms.includes(rule.type as SymptomType)) {
      detectedSymptoms.push(rule.type as SymptomType);
      if (rule.severity === 'yellow') maxSeverity = 'yellow';
    }
  }

  if (detectedSymptoms.length > 0) {
    result.intent = 'specific_symptom';
    result.symptoms = detectedSymptoms;
    result.severity = maxSeverity;
    result.sentiment = 'negative';
    return result;
  }

  // 3. Medication-specific intents
  if (matchesAny(raw, MED_ISSUE_PATTERNS)) {
    result.intent = 'medication_issue';
    result.sentiment = 'negative';
    return result;
  }
  if (matchesAny(raw, MED_NO_PATTERNS)) {
    result.intent = 'medication_no';
    result.sentiment = 'negative';
    return result;
  }
  if (matchesAny(raw, MED_YES_PATTERNS)) {
    result.intent = 'medication_yes';
    result.sentiment = 'positive';
    return result;
  }

  // 4. Check short-form affirmative/negative before longer patterns
  if (matchesAny(raw, AFFIRMATIVE_PATTERNS)) {
    result.intent = 'affirmative';
    result.sentiment = 'positive';
    return result;
  }
  if (matchesAny(raw, NEGATIVE_SHORT_PATTERNS)) {
    result.intent = 'negative_short';
    result.sentiment = 'negative';
    return result;
  }

  // 5. Frustration (before emotional — "stop bothering me" is frustration, not emotion)
  if (matchesAny(raw, FRUSTRATION_PATTERNS)) {
    result.intent = 'frustration';
    result.sentiment = 'negative';
    return result;
  }

  // 6. Negative feeling (before positive — "not good" should match negative, not positive)
  if (matchesAny(raw, NEGATIVE_FEELING_PATTERNS)) {
    result.intent = 'negative_feeling';
    result.sentiment = 'negative';
    return result;
  }

  // 7. Emotional
  if (matchesAny(raw, EMOTIONAL_PATTERNS)) {
    result.intent = 'emotional';
    result.sentiment = 'negative';
    return result;
  }

  // 8. Positive
  if (matchesAny(raw, POSITIVE_PATTERNS)) {
    result.intent = 'positive_feeling';
    result.sentiment = 'positive';
    return result;
  }

  // 9. Question
  if (matchesAny(raw, QUESTION_PATTERNS)) {
    result.intent = 'question';
    return result;
  }

  // 10. Greeting
  if (matchesAny(raw, GREETING_PATTERNS)) {
    result.intent = 'greeting';
    result.sentiment = 'positive';
    return result;
  }

  // 11. Goodbye
  if (matchesAny(raw, GOODBYE_PATTERNS)) {
    result.intent = 'goodbye';
    result.sentiment = 'positive';
    return result;
  }

  // 12. Life update
  if (matchesAny(raw, LIFE_UPDATE_PATTERNS)) {
    result.intent = 'life_update';
    result.sentiment = 'positive';
    return result;
  }

  // 13. Unclear — couldn't classify
  return result;
}
