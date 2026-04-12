/**
 * Avyay Health — Clinical Conversation Engine (v2)
 * =================================================
 * Production-grade conversational AI for post-discharge check-ins.
 *
 * Design principles:
 *   1. Handle ANYTHING — gibberish, emojis, life updates, random words, silence
 *   2. Never sound robotic — warm, human, like a caring nurse who knows you
 *   3. Always move the conversation forward — gently steer back to clinical topics
 *   4. Condition-aware — CHF cares about swelling, COPD about breathing, etc.
 *   5. Day-aware — early days are more careful, later days more celebratory
 *   6. Never repeat the same response twice in a conversation
 */

import type { Condition, RiskLevel } from '../types';
import type { ConversationPhase, ConversationState, PhaseInput, PhaseOutput } from './types';
import { classify } from './classify';
import {
  handleSymptomCheck,
  handleSymptomFollowUp,
  handleMedicationCheck,
  handleSdohScreen,
} from './phases';
import { generateCompletionMessage } from './responses';

// Re-export types that consumers need
export type { ConversationPhase, ConversationState } from './types';
export type { ClassificationResult, Intent, SymptomType, PhaseInput, PhaseOutput } from './types';
export { classify } from './classify';

// ─── Initial state factory ────────────────────────────────────────

export function createInitialState(): ConversationState {
  return {
    phase: 'symptom_check',
    turnCount: 0,
    overallRisk: 'green',
    detectedSymptoms: [],
    medicationStatus: 'unknown',
    sdohConcern: null,
    summaryParts: [],
    usedResponseKeys: [],
  };
}

// ─── Main engine entry point ──────────────────────────────────────

interface EngineInput {
  patientText: string;
  firstName: string;
  condition: Condition;
  dayNumber: number;
  state: ConversationState;
}

interface EngineOutput {
  responses: string[];
  nextState: ConversationState;
  isComplete: boolean;
  riskLevel: RiskLevel;
}

export function processReply(input: EngineInput): EngineOutput {
  const { patientText, state } = input;
  const cl = classify(patientText);
  const nextState = { ...state, turnCount: state.turnCount + 1, usedResponseKeys: [...state.usedResponseKeys] };

  // Upgrade risk based on classification
  if (cl.severity === 'red') nextState.overallRisk = 'red';
  else if (cl.severity === 'yellow' && nextState.overallRisk !== 'red') nextState.overallRisk = 'yellow';

  // Safety: prevent infinite conversations (max 8 turns)
  if (nextState.turnCount > 8) {
    const msg = generateCompletionMessage(input.firstName, input.dayNumber, nextState);
    nextState.phase = 'complete';
    return { responses: [msg], nextState, isComplete: true, riskLevel: nextState.overallRisk };
  }

  const phaseInput: PhaseInput = {
    text: patientText,
    cl,
    firstName: input.firstName,
    condition: input.condition,
    dayNumber: input.dayNumber,
    state: nextState,
  };

  let result: PhaseOutput;
  switch (state.phase) {
    case 'symptom_check':
      result = handleSymptomCheck(phaseInput);
      break;
    case 'symptom_followup':
      result = handleSymptomFollowUp(phaseInput);
      break;
    case 'medication_check':
    case 'medication_followup':
      result = handleMedicationCheck(phaseInput);
      break;
    case 'sdoh_screen':
      result = handleSdohScreen(phaseInput);
      break;
    default:
      result = {
        responses: [`Thank you, ${input.firstName}. Your check-in is complete for today — we'll talk again tomorrow.`],
        nextPhase: 'complete',
        isComplete: true,
      };
  }

  nextState.phase = result.nextPhase;
  return {
    responses: result.responses,
    nextState,
    isComplete: result.isComplete,
    riskLevel: nextState.overallRisk,
  };
}

// ─── Summary builder ──────────────────────────────────────────────

export function buildSummary(state: ConversationState): string {
  if (state.summaryParts.length === 0) return 'Check-in completed. No concerns reported.';
  return state.summaryParts.join('. ') + '.';
}

// ─── Quick replies ────────────────────────────────────────────────

export function getQuickRepliesForPhase(phase: ConversationPhase, condition: Condition): string[] {
  switch (phase) {
    case 'symptom_check':
      if (condition === 'chf') return ['Feeling good', 'A bit tired', 'Some swelling', 'Short of breath'];
      if (condition === 'copd') return ['Feeling good', 'A bit tired', 'Coughing more', 'Harder to breathe'];
      if (condition === 'pneumonia') return ['Feeling good', 'A bit tired', 'Still coughing', 'Have a fever'];
      return ['Feeling good', 'A bit tired', 'Some pain', 'Not great today'];

    case 'symptom_followup':
      if (condition === 'chf') return ['No, just that', 'Some swelling too', 'A bit dizzy', 'It\'s getting worse'];
      if (condition === 'copd') return ['No, that\'s all', 'More mucus', 'A little wheezy', 'It\'s getting worse'];
      return ['No, that\'s all', 'A little', 'Yes, getting worse', 'Not sure'];

    case 'medication_check':
      return ['Yes, all taken', 'Missed one today', 'Need a refill', 'Having side effects'];

    case 'sdoh_screen':
      return ['Yes, all good', 'Could use some help', 'It\'s been difficult'];

    default:
      return [];
  }
}
