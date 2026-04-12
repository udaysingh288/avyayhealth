/** Clinical constants shared across patient app, edge functions, and dashboards. */

import type { Condition } from '../types';

/** Keywords that indicate a potential emergency — used for client-side RED detection. */
export const RED_KEYWORDS = [
  'cannot breathe', "can't breathe", 'cant breathe', 'hard to breathe',
  'trouble breathing', 'chest pain', 'chest hurts', 'blue lips',
  'blue fingers', 'passed out', 'fainted', 'heart attack',
  'not breathing', 'unconscious', 'dying', 'very short of breath',
  'extremely short of breath', "can't sleep lying flat",
] as const;

/** Regex patterns for emergency detection in conversation engine + edge functions. */
export const EMERGENCY_PATTERNS = [
  /can'?t\s*breathe/i, /cannot\s*breathe/i, /hard\s*to\s*breathe/i,
  /chest\s*pain/i, /chest\s*hurts?/i, /severe\s*chest/i,
  /blue\s*(lips?|fingers?|nails?)/i, /passed?\s*out/i, /fainted/i,
  /heart\s*attack/i, /not\s*breathing/i, /unconscious/i,
  /\b911\b/, /\bdying\b/i, /can'?t\s*sleep\s*(lying|flat)/i,
  /very\s*short\s*of\s*breath/i, /extremely\s*short\s*of\s*breath/i,
] as const;

export type SymptomType =
  | 'breathing' | 'swelling' | 'chest_pain' | 'cough' | 'fatigue'
  | 'pain' | 'fever' | 'weight_gain' | 'dizziness' | 'nausea'
  | 'sleep' | 'appetite' | 'confusion' | 'mucus';

export interface SymptomRule {
  pattern: RegExp;
  type: SymptomType;
  severity: 'yellow' | 'green';
}

/** Regex-based symptom detection rules used by the conversation engine. */
export const SYMPTOM_RULES: SymptomRule[] = [
  // Breathing
  { pattern: /short(ness)?\s*(of\s*)?breath/i, type: 'breathing', severity: 'yellow' },
  { pattern: /breath(ing|less|e)\s*(hard|difficult|worse|problem)/i, type: 'breathing', severity: 'yellow' },
  { pattern: /hard(er)?\s*to\s*breathe/i, type: 'breathing', severity: 'yellow' },
  { pattern: /winded/i, type: 'breathing', severity: 'yellow' },
  { pattern: /wheez(ing|e|y)/i, type: 'breathing', severity: 'yellow' },
  { pattern: /gasping/i, type: 'breathing', severity: 'yellow' },

  // Swelling
  { pattern: /swell(ing|ed|olen)/i, type: 'swelling', severity: 'yellow' },
  { pattern: /ankle.*(puff|swell|big)/i, type: 'swelling', severity: 'yellow' },
  { pattern: /feet.*(swell|puff|big)/i, type: 'swelling', severity: 'yellow' },
  { pattern: /legs?.*(swell|puff|big|heavy)/i, type: 'swelling', severity: 'yellow' },
  { pattern: /puffy/i, type: 'swelling', severity: 'yellow' },
  { pattern: /bloat(ed|ing)?/i, type: 'swelling', severity: 'yellow' },

  // Chest pain (non-emergency level)
  { pattern: /chest\s*(tight|pressure|discomfort)/i, type: 'chest_pain', severity: 'yellow' },
  { pattern: /tight(ness)?\s*(in\s*(my\s*)?)?chest/i, type: 'chest_pain', severity: 'yellow' },

  // Cough
  { pattern: /cough(ing|ed|s)?/i, type: 'cough', severity: 'green' },
  { pattern: /cough.*(worse|more|bad|constant)/i, type: 'cough', severity: 'yellow' },
  { pattern: /hack(ing)?/i, type: 'cough', severity: 'green' },

  // Mucus
  { pattern: /mucus/i, type: 'mucus', severity: 'yellow' },
  { pattern: /phlegm/i, type: 'mucus', severity: 'yellow' },
  { pattern: /(green|yellow|brown|bloody)\s*(mucus|phlegm|sputum)/i, type: 'mucus', severity: 'yellow' },

  // Fatigue
  { pattern: /tired/i, type: 'fatigue', severity: 'green' },
  { pattern: /exhaust(ed|ing)/i, type: 'fatigue', severity: 'green' },
  { pattern: /fatigue/i, type: 'fatigue', severity: 'green' },
  { pattern: /no\s*energy/i, type: 'fatigue', severity: 'green' },
  { pattern: /weak(ness)?/i, type: 'fatigue', severity: 'green' },
  { pattern: /worn\s*out/i, type: 'fatigue', severity: 'green' },
  { pattern: /wiped\s*out/i, type: 'fatigue', severity: 'green' },
  { pattern: /drain(ed|ing)/i, type: 'fatigue', severity: 'green' },

  // Pain
  { pattern: /pain(ful|s|ing)?/i, type: 'pain', severity: 'green' },
  { pattern: /\bhurts?\b/i, type: 'pain', severity: 'green' },
  { pattern: /\bsore(ness)?\b/i, type: 'pain', severity: 'green' },
  { pattern: /\bach(e|es|ing|y)\b/i, type: 'pain', severity: 'green' },
  { pattern: /throb(bing)?/i, type: 'pain', severity: 'green' },

  // Fever
  { pattern: /fever/i, type: 'fever', severity: 'yellow' },
  { pattern: /temperature/i, type: 'fever', severity: 'yellow' },
  { pattern: /chills?/i, type: 'fever', severity: 'yellow' },
  { pattern: /sweating/i, type: 'fever', severity: 'green' },

  // Weight
  { pattern: /weight\s*(gain|up|increase)/i, type: 'weight_gain', severity: 'yellow' },
  { pattern: /gain(ed|ing)?\s*weight/i, type: 'weight_gain', severity: 'yellow' },
  { pattern: /heavier/i, type: 'weight_gain', severity: 'yellow' },
  { pattern: /(2|3|4|5|two|three|four|five)\s*(lbs?|pounds?)\s*(heavier|more|gain)/i, type: 'weight_gain', severity: 'yellow' },

  // Dizziness
  { pattern: /dizz(y|iness)/i, type: 'dizziness', severity: 'yellow' },
  { pattern: /light\s*head(ed)?/i, type: 'dizziness', severity: 'yellow' },
  { pattern: /vertigo/i, type: 'dizziness', severity: 'yellow' },
  { pattern: /room\s*(spin|swirl|mov)/i, type: 'dizziness', severity: 'yellow' },
  { pattern: /unsteady/i, type: 'dizziness', severity: 'green' },

  // Nausea
  { pattern: /nause(a|ous|ated)/i, type: 'nausea', severity: 'yellow' },
  { pattern: /throw(ing)?\s*up/i, type: 'nausea', severity: 'yellow' },
  { pattern: /threw\s*up/i, type: 'nausea', severity: 'yellow' },
  { pattern: /vomit(ing|ed)?/i, type: 'nausea', severity: 'yellow' },
  { pattern: /sick\s*to\s*(my\s*)?stomach/i, type: 'nausea', severity: 'yellow' },
  { pattern: /queasy/i, type: 'nausea', severity: 'green' },

  // Sleep
  { pattern: /can'?t\s*sleep/i, type: 'sleep', severity: 'green' },
  { pattern: /couldn'?t\s*sleep/i, type: 'sleep', severity: 'green' },
  { pattern: /trouble\s*sleep/i, type: 'sleep', severity: 'green' },
  { pattern: /insomnia/i, type: 'sleep', severity: 'green' },
  { pattern: /up\s*all\s*night/i, type: 'sleep', severity: 'green' },
  { pattern: /woke\s*up\s*(a\s*lot|multiple|several|many)/i, type: 'sleep', severity: 'green' },

  // Appetite
  { pattern: /no\s*appetite/i, type: 'appetite', severity: 'green' },
  { pattern: /not\s*(eating|hungry)/i, type: 'appetite', severity: 'green' },
  { pattern: /can'?t\s*eat/i, type: 'appetite', severity: 'green' },
  { pattern: /lost\s*(my\s*)?appetite/i, type: 'appetite', severity: 'green' },

  // Confusion
  { pattern: /confus(ed|ing|ion)/i, type: 'confusion', severity: 'yellow' },
  { pattern: /foggy/i, type: 'confusion', severity: 'green' },
  { pattern: /forgetful/i, type: 'confusion', severity: 'green' },
  { pattern: /brain\s*fog/i, type: 'confusion', severity: 'green' },
];

/** Human-readable condition labels. */
export const CONDITION_LABELS: Record<Condition, string> = {
  chf: 'Heart Failure',
  copd: 'COPD',
  pneumonia: 'Pneumonia',
  ami: 'Heart Attack',
  hip_knee: 'Hip/Knee',
  cabg: 'CABG',
};

/** Check if free-text contains a RED emergency keyword. */
export function containsRedKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_KEYWORDS.some((k) => lower.includes(k));
}
