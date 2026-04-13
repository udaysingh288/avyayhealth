import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  processReply,
  buildSummary,
  getQuickRepliesForPhase,
} from '../index';

describe('createInitialState', () => {
  it('starts at symptom_check phase', () => {
    expect(createInitialState().phase).toBe('symptom_check');
  });

  it('starts at turnCount 0', () => {
    expect(createInitialState().turnCount).toBe(0);
  });

  it('starts at green risk', () => {
    expect(createInitialState().overallRisk).toBe('green');
  });

  it('starts with empty symptoms', () => {
    expect(createInitialState().detectedSymptoms).toEqual([]);
  });

  it('starts with unknown medication status', () => {
    expect(createInitialState().medicationStatus).toBe('unknown');
  });

  it('starts with no sdoh concern', () => {
    expect(createInitialState().sdohConcern).toBeNull();
  });

  it('starts with empty summary parts', () => {
    expect(createInitialState().summaryParts).toEqual([]);
  });

  it('starts with empty used response keys', () => {
    expect(createInitialState().usedResponseKeys).toEqual([]);
  });
});

describe('processReply', () => {
  it('increments turnCount', () => {
    const state = createInitialState();
    const result = processReply({
      patientText: 'feeling good',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.nextState.turnCount).toBe(1);
  });

  it('transitions from symptom_check to medication_check on positive feeling', () => {
    const state = createInitialState();
    const result = processReply({
      patientText: 'feeling great today',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.nextState.phase).toBe('medication_check');
    expect(result.isComplete).toBe(false);
  });

  it('transitions to symptom_followup on negative feeling', () => {
    const state = createInitialState();
    const result = processReply({
      patientText: 'not good',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.nextState.phase).toBe('symptom_followup');
  });

  it('escalates to red on emergency input', () => {
    const state = createInitialState();
    const result = processReply({
      patientText: "can't breathe",
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.riskLevel).toBe('red');
    expect(result.nextState.overallRisk).toBe('red');
  });

  it('risk only escalates — yellow does not override red', () => {
    const state = createInitialState();
    state.overallRisk = 'red';
    const result = processReply({
      patientText: 'feeling a bit tired',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.riskLevel).toBe('red');
  });

  it('does not mutate the original state', () => {
    const state = createInitialState();
    const originalPhase = state.phase;
    processReply({
      patientText: 'feeling good',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(state.phase).toBe(originalPhase);
    expect(state.turnCount).toBe(0);
  });

  it('forces completion after 8 turns', () => {
    const state = createInitialState();
    state.turnCount = 8;
    const result = processReply({
      patientText: 'hello',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.isComplete).toBe(true);
    expect(result.nextState.phase).toBe('complete');
  });

  it('returns at least one response', () => {
    const state = createInitialState();
    const result = processReply({
      patientText: 'asdfghjkl',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(result.responses.length).toBeGreaterThan(0);
  });

  it('full positive flow: positive → meds taken → complete on non-SDOH day', () => {
    let state = createInitialState();

    // Step 1: positive feeling → medication_check
    const step1 = processReply({
      patientText: 'feeling great',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state,
    });
    expect(step1.nextState.phase).toBe('medication_check');

    // Step 2: medication yes → complete (day 5 is not an SDOH day)
    const step2 = processReply({
      patientText: 'yes took all my meds',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 5,
      state: step1.nextState,
    });
    expect(step2.isComplete).toBe(true);
    expect(step2.nextState.phase).toBe('complete');
    expect(step2.riskLevel).toBe('green');
  });

  it('SDOH day flow: meds → sdoh_screen', () => {
    // Day 3 is an SDOH screening day (transportation)
    const state = createInitialState();
    state.phase = 'medication_check';
    state.turnCount = 1;

    const result = processReply({
      patientText: 'yes all taken',
      firstName: 'Maria',
      condition: 'chf',
      dayNumber: 3,
      state,
    });
    expect(result.nextState.phase).toBe('sdoh_screen');
    expect(result.isComplete).toBe(false);
  });
});

describe('buildSummary', () => {
  it('returns default message for empty summary parts', () => {
    const state = createInitialState();
    expect(buildSummary(state)).toBe('Check-in completed. No concerns reported.');
  });

  it('joins summary parts with periods', () => {
    const state = createInitialState();
    state.summaryParts = ['Patient reports feeling well', 'Medications taken as prescribed'];
    expect(buildSummary(state)).toBe('Patient reports feeling well. Medications taken as prescribed.');
  });

  it('handles a single summary part', () => {
    const state = createInitialState();
    state.summaryParts = ['Reports swelling'];
    expect(buildSummary(state)).toBe('Reports swelling.');
  });
});

describe('getQuickRepliesForPhase', () => {
  it('returns CHF-specific quick replies for symptom_check', () => {
    const replies = getQuickRepliesForPhase('symptom_check', 'chf');
    expect(replies).toContain('Short of breath');
    expect(replies).toContain('Some swelling');
    expect(replies).toContain('Feeling good');
  });

  it('returns COPD-specific quick replies for symptom_check', () => {
    const replies = getQuickRepliesForPhase('symptom_check', 'copd');
    expect(replies).toContain('Harder to breathe');
    expect(replies).toContain('Coughing more');
  });

  it('returns pneumonia-specific quick replies', () => {
    const replies = getQuickRepliesForPhase('symptom_check', 'pneumonia');
    expect(replies).toContain('Still coughing');
    expect(replies).toContain('Have a fever');
  });

  it('returns medication quick replies', () => {
    const replies = getQuickRepliesForPhase('medication_check', 'chf');
    expect(replies).toContain('Yes, all taken');
    expect(replies).toContain('Missed one today');
  });

  it('returns SDOH quick replies', () => {
    const replies = getQuickRepliesForPhase('sdoh_screen', 'chf');
    expect(replies).toContain('Yes, all good');
  });

  it('returns empty array for complete phase', () => {
    expect(getQuickRepliesForPhase('complete', 'chf')).toEqual([]);
  });
});
