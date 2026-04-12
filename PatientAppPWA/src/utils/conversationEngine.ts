/**
 * Re-export bridge — the conversation engine has been split into
 * PatientAppPWA/src/engine/ for maintainability.
 *
 * Import directly from '../engine' in new code.
 */
export {
  processReply,
  createInitialState,
  buildSummary,
  getQuickRepliesForPhase,
  classify,
} from '../engine';

export type {
  ConversationPhase,
  ConversationState,
  ClassificationResult,
  Intent,
  SymptomType,
  PhaseInput,
  PhaseOutput,
} from '../engine';
