import { describe, it, expect } from 'vitest';
import {
  handleSymptomCheck,
  handleSymptomFollowUp,
  handleMedicationCheck,
  handleSdohScreen,
} from '../phases';
import { classify } from '../classify';
import type { ConversationState, PhaseInput } from '../types';

function freshState(overrides?: Partial<ConversationState>): ConversationState {
  return {
    phase: 'symptom_check',
    turnCount: 0,
    overallRisk: 'green',
    detectedSymptoms: [],
    medicationStatus: 'unknown',
    sdohConcern: null,
    summaryParts: [],
    usedResponseKeys: [],
    ...overrides,
  };
}

function makeInput(text: string, overrides?: Partial<PhaseInput>): PhaseInput {
  return {
    text,
    cl: classify(text),
    firstName: 'Maria',
    condition: 'chf',
    dayNumber: 5,
    state: freshState(),
    ...overrides,
  };
}

// ─── Symptom Check Phase ─────────────────────────────────────────

describe('handleSymptomCheck', () => {
  it('positive feeling → medication_check', () => {
    const result = handleSymptomCheck(makeInput('feeling good'));
    expect(result.nextPhase).toBe('medication_check');
    expect(result.isComplete).toBe(false);
  });

  it('positive feeling response includes medication question', () => {
    const result = handleSymptomCheck(makeInput('feeling great'));
    expect(result.responses.length).toBeGreaterThanOrEqual(2);
    expect(result.responses.some(r => /medication/i.test(r))).toBe(true);
  });

  it('negative feeling → symptom_followup', () => {
    const result = handleSymptomCheck(makeInput('not good'));
    expect(result.nextPhase).toBe('symptom_followup');
    expect(result.isComplete).toBe(false);
  });

  it('negative feeling adds to summary', () => {
    const state = freshState();
    handleSymptomCheck(makeInput('not good', { state }));
    expect(state.summaryParts.length).toBeGreaterThan(0);
    expect(state.summaryParts[0]).toMatch(/not feeling well/i);
  });

  it('specific symptom → symptom_followup', () => {
    const result = handleSymptomCheck(makeInput('short of breath'));
    expect(result.nextPhase).toBe('symptom_followup');
  });

  it('specific symptom adds to detectedSymptoms', () => {
    const state = freshState();
    handleSymptomCheck(makeInput('short of breath', { state }));
    expect(state.detectedSymptoms).toContain('breathing');
  });

  it('emotional concern → symptom_followup + escalates risk', () => {
    const state = freshState();
    const result = handleSymptomCheck(makeInput("I'm scared", { state }));
    expect(result.nextPhase).toBe('symptom_followup');
    expect(state.overallRisk).toBe('yellow');
  });

  it('greeting → stays on symptom_check', () => {
    const result = handleSymptomCheck(makeInput('hello'));
    expect(result.nextPhase).toBe('symptom_check');
  });

  it('life update → symptom_followup', () => {
    const result = handleSymptomCheck(makeInput('my daughter visited'));
    expect(result.nextPhase).toBe('symptom_followup');
  });

  it('question → symptom_followup with question response', () => {
    const result = handleSymptomCheck(makeInput('is that normal?'));
    expect(result.nextPhase).toBe('symptom_followup');
    expect(result.responses.length).toBeGreaterThan(0);
  });

  it('frustration → symptom_followup with empathetic response', () => {
    const result = handleSymptomCheck(makeInput('stop texting me'));
    expect(result.nextPhase).toBe('symptom_followup');
    expect(result.responses.some(r => /understand/i.test(r))).toBe(true);
  });

  it('affirmative → symptom_followup', () => {
    const result = handleSymptomCheck(makeInput('yes'));
    expect(result.nextPhase).toBe('symptom_followup');
  });

  it('negative_short → symptom_followup', () => {
    const state = freshState();
    const result = handleSymptomCheck(makeInput('no', { state }));
    expect(result.nextPhase).toBe('symptom_followup');
    expect(state.summaryParts).toContain('Patient reports not feeling well');
  });

  it('unclear input → symptom_followup', () => {
    const result = handleSymptomCheck(makeInput('asdfghjkl'));
    expect(result.nextPhase).toBe('symptom_followup');
  });

  it('day-aware positive response (early days)', () => {
    const result = handleSymptomCheck(makeInput('feeling good', { dayNumber: 3 }));
    expect(result.responses[0]).toMatch(/first|adjust|important|discharge/i);
  });

  it('goodbye → symptom_followup with redirect', () => {
    const result = handleSymptomCheck(makeInput('goodbye'));
    expect(result.nextPhase).toBe('symptom_followup');
    expect(result.responses[0]).toMatch(/before we wrap|symptoms|concerns/i);
  });
});

// ─── Symptom Follow-Up Phase ─────────────────────────────────────

describe('handleSymptomFollowUp', () => {
  it('specific symptom adds to detected and gives response', () => {
    const state = freshState();
    const result = handleSymptomFollowUp(makeInput('my ankles are swollen', { state }));
    expect(state.detectedSymptoms).toContain('swelling');
    expect(result.nextPhase).toBe('medication_check');
  });

  it('positive feeling → medication_check', () => {
    const result = handleSymptomFollowUp(makeInput('feeling fine'));
    expect(result.nextPhase).toBe('medication_check');
  });

  it('negative feeling escalates risk to yellow', () => {
    const state = freshState();
    handleSymptomFollowUp(makeInput('feeling terrible', { state }));
    expect(state.overallRisk).toBe('yellow');
  });

  it('always includes medication question in responses', () => {
    const result = handleSymptomFollowUp(makeInput('no that is all'));
    expect(result.responses.some(r => /medication/i.test(r))).toBe(true);
  });

  it('emotional concern escalates to yellow', () => {
    const state = freshState();
    handleSymptomFollowUp(makeInput('feeling lonely', { state }));
    expect(state.overallRisk).toBe('yellow');
  });

  it('always transitions to medication_check', () => {
    expect(handleSymptomFollowUp(makeInput('asdfghjkl')).nextPhase).toBe('medication_check');
    expect(handleSymptomFollowUp(makeInput('feeling good')).nextPhase).toBe('medication_check');
    expect(handleSymptomFollowUp(makeInput('stop texting me')).nextPhase).toBe('medication_check');
  });
});

// ─── Medication Check Phase ──────────────────────────────────────

describe('handleMedicationCheck', () => {
  it('medication_yes → adherent + green stays green', () => {
    const state = freshState({ phase: 'medication_check' });
    const result = handleMedicationCheck(makeInput('yes took all my meds', { state, dayNumber: 5 }));
    expect(state.medicationStatus).toBe('adherent');
    expect(state.overallRisk).toBe('green');
    expect(result.isComplete).toBe(true);
    expect(result.nextPhase).toBe('complete');
  });

  it('medication_no → missed + escalates to yellow', () => {
    const state = freshState({ phase: 'medication_check' });
    handleMedicationCheck(makeInput('missed a dose', { state, dayNumber: 5 }));
    expect(state.medicationStatus).toBe('missed');
    expect(state.overallRisk).toBe('yellow');
  });

  it('medication_issue → needs_help + escalates to yellow', () => {
    const state = freshState({ phase: 'medication_check' });
    handleMedicationCheck(makeInput('need a refill', { state, dayNumber: 5 }));
    expect(state.medicationStatus).toBe('needs_help');
    expect(state.overallRisk).toBe('yellow');
  });

  it('affirmative is interpreted as medication_yes', () => {
    const state = freshState({ phase: 'medication_check' });
    handleMedicationCheck(makeInput('yes', { state, dayNumber: 5 }));
    expect(state.medicationStatus).toBe('adherent');
  });

  it('negative_short is interpreted as medication_no', () => {
    const state = freshState({ phase: 'medication_check' });
    handleMedicationCheck(makeInput('no', { state, dayNumber: 5 }));
    expect(state.medicationStatus).toBe('missed');
  });

  it('question stays on medication_check', () => {
    const result = handleMedicationCheck(makeInput('when should I take it?', { dayNumber: 5 }));
    expect(result.nextPhase).toBe('medication_check');
    expect(result.isComplete).toBe(false);
  });

  it('specific symptom during medication check stays on medication_check', () => {
    const state = freshState();
    const result = handleMedicationCheck(makeInput('my ankles are swollen', { state, dayNumber: 5 }));
    expect(result.nextPhase).toBe('medication_check');
    expect(state.detectedSymptoms).toContain('swelling');
  });

  it('SDOH screening day → sdoh_screen phase', () => {
    const state = freshState({ phase: 'medication_check' });
    const result = handleMedicationCheck(makeInput('yes all taken', { state, dayNumber: 3 }));
    expect(result.nextPhase).toBe('sdoh_screen');
    expect(result.isComplete).toBe(false);
  });

  it('non-SDOH day → complete', () => {
    const state = freshState({ phase: 'medication_check' });
    const result = handleMedicationCheck(makeInput('yes all taken', { state, dayNumber: 5 }));
    expect(result.nextPhase).toBe('complete');
    expect(result.isComplete).toBe(true);
  });

  it('medication_no does not override existing red risk', () => {
    const state = freshState({ phase: 'medication_check', overallRisk: 'red' });
    handleMedicationCheck(makeInput('missed a dose', { state, dayNumber: 5 }));
    expect(state.overallRisk).toBe('red');
  });
});

// ─── SDOH Screen Phase ───────────────────────────────────────────

describe('handleSdohScreen', () => {
  it('positive response → complete without concern', () => {
    const state = freshState({ phase: 'sdoh_screen' });
    const result = handleSdohScreen(makeInput('yes all good', { state, dayNumber: 3 }));
    expect(result.isComplete).toBe(true);
    expect(result.nextPhase).toBe('complete');
    expect(state.sdohConcern).toBeNull();
  });

  it('negative response → flags concern + escalates to yellow', () => {
    const state = freshState({ phase: 'sdoh_screen' });
    const result = handleSdohScreen(makeInput("no I don't have a ride", { state, dayNumber: 3 }));
    expect(result.isComplete).toBe(true);
    expect(state.sdohConcern).toBe('transportation');
    expect(state.overallRisk).toBe('yellow');
  });

  it('includes completion message in responses', () => {
    const state = freshState({ phase: 'sdoh_screen' });
    const result = handleSdohScreen(makeInput('yes fine', { state, dayNumber: 3 }));
    expect(result.responses.length).toBeGreaterThanOrEqual(2);
  });

  it('food insecurity concern on day 7', () => {
    const state = freshState({ phase: 'sdoh_screen' });
    handleSdohScreen(makeInput("it's been difficult to get food", { state, dayNumber: 7 }));
    expect(state.sdohConcern).toBe('food_insecurity');
  });

  it('housing concern on day 14', () => {
    const state = freshState({ phase: 'sdoh_screen' });
    handleSdohScreen(makeInput("I'm worried about my living situation", { state, dayNumber: 14 }));
    expect(state.sdohConcern).toBe('housing_instability');
  });

  it('does not flag concern for positive response even with negative keywords in question', () => {
    const state = freshState({ phase: 'sdoh_screen' });
    handleSdohScreen(makeInput('yes all good', { state, dayNumber: 3 }));
    expect(state.sdohConcern).toBeNull();
  });
});
