/**
 * Types for the clinical conversation engine.
 */

import type { Condition, RiskLevel } from '../types';

export type Intent =
  | 'positive_feeling'
  | 'negative_feeling'
  | 'specific_symptom'
  | 'emergency'
  | 'medication_yes'
  | 'medication_no'
  | 'medication_issue'
  | 'sdoh_ok'
  | 'sdoh_concern'
  | 'question'
  | 'emotional'
  | 'life_update'
  | 'greeting'
  | 'affirmative'
  | 'negative_short'
  | 'unclear'
  | 'goodbye'
  | 'frustration';

export type SymptomType =
  | 'breathing' | 'swelling' | 'chest_pain' | 'cough' | 'fatigue'
  | 'pain' | 'fever' | 'weight_gain' | 'dizziness' | 'nausea'
  | 'sleep' | 'appetite' | 'confusion' | 'mucus';

export interface ClassificationResult {
  intent: Intent;
  symptoms: SymptomType[];
  severity: 'green' | 'yellow' | 'red';
  sentiment: 'positive' | 'negative' | 'neutral';
  raw: string;
}

export type ConversationPhase =
  | 'symptom_check'
  | 'symptom_followup'
  | 'medication_check'
  | 'medication_followup'
  | 'sdoh_screen'
  | 'complete';

export interface ConversationState {
  phase: ConversationPhase;
  turnCount: number;
  overallRisk: RiskLevel;
  detectedSymptoms: SymptomType[];
  medicationStatus: 'unknown' | 'adherent' | 'missed' | 'needs_help';
  sdohConcern: string | null;
  summaryParts: string[];
  usedResponseKeys: string[];
}

export interface PhaseInput {
  text: string;
  cl: ClassificationResult;
  firstName: string;
  condition: Condition;
  dayNumber: number;
  state: ConversationState;
}

export interface PhaseOutput {
  responses: string[];
  nextPhase: ConversationPhase;
  isComplete: boolean;
}
