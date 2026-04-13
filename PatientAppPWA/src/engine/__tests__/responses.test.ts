import { describe, it, expect } from 'vitest';
import {
  pick,
  generateSymptomResponse,
  generateSymptomFollowUp,
  generateQuestionResponse,
  generateCompletionMessage,
} from '../responses';
import type { ConversationState } from '../types';

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

describe('pick', () => {
  it('returns the first unused response', () => {
    const state = freshState();
    const result = pick(['Hello', 'Hi', 'Hey'], state, 'greet');
    expect(result).toBe('Hello');
  });

  it('tracks the used key', () => {
    const state = freshState();
    pick(['Hello', 'Hi'], state, 'greet');
    expect(state.usedResponseKeys).toContain('greet:0');
  });

  it('skips already-used responses', () => {
    const state = freshState({ usedResponseKeys: ['greet:0'] });
    const result = pick(['Hello', 'Hi', 'Hey'], state, 'greet');
    expect(result).toBe('Hi');
  });

  it('wraps around when all responses are used', () => {
    const state = freshState({
      usedResponseKeys: ['greet:0', 'greet:1', 'greet:2'],
      turnCount: 1,
    });
    const result = pick(['Hello', 'Hi', 'Hey'], state, 'greet');
    expect(result).toBe('Hi'); // pool[1 % 3]
  });

  it('returns empty string for empty pool', () => {
    const state = freshState();
    expect(pick([], state, 'empty')).toBe('');
  });

  it('returns the only item from a single-item pool', () => {
    const state = freshState();
    expect(pick(['Only'], state, 'solo')).toBe('Only');
  });
});

describe('generateSymptomResponse', () => {
  it('returns a string containing the patient first name', () => {
    const state = freshState();
    const result = generateSymptomResponse(['breathing'], 'yellow', 'chf', 'Maria', state);
    expect(result).toContain('Maria');
    expect(result.length).toBeGreaterThan(0);
  });

  it('gives CHF-specific response for breathing', () => {
    const state = freshState();
    const result = generateSymptomResponse(['breathing'], 'yellow', 'chf', 'Maria', state);
    expect(result).toMatch(/heart failure|breathing/i);
  });

  it('gives COPD-specific response for breathing', () => {
    const state = freshState();
    const result = generateSymptomResponse(['breathing'], 'yellow', 'copd', 'James', state);
    expect(result).toMatch(/COPD|breathing/i);
  });

  it('gives swelling-specific response', () => {
    const state = freshState();
    const result = generateSymptomResponse(['swelling'], 'yellow', 'chf', 'Maria', state);
    expect(result).toMatch(/[Ss]well/);
  });

  it('gives fatigue response at green severity', () => {
    const state = freshState();
    const result = generateSymptomResponse(['fatigue'], 'green', 'chf', 'Maria', state);
    expect(result).toMatch(/tir|fatig|rest/i);
  });

  it('gives generic response for uncommon green symptom', () => {
    const state = freshState();
    const result = generateSymptomResponse(['appetite'], 'green', 'chf', 'Maria', state);
    expect(result).toContain('Maria');
  });

  it('treats red severity as yellow (safety fallback)', () => {
    const state = freshState();
    // Should not crash — red is treated as yellow internally
    const result = generateSymptomResponse(['breathing'], 'red', 'chf', 'Maria', state);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('generateSymptomFollowUp', () => {
  it('asks about swelling for CHF breathing', () => {
    const state = freshState();
    const result = generateSymptomFollowUp(['breathing'], 'chf', state);
    expect(result).toMatch(/swelling|ankle|sock/i);
  });

  it('asks about mucus for COPD breathing', () => {
    const state = freshState();
    const result = generateSymptomFollowUp(['breathing'], 'copd', state);
    expect(result).toMatch(/mucus|inhaler/i);
  });

  it('asks about weight for swelling', () => {
    const state = freshState();
    const result = generateSymptomFollowUp(['swelling'], 'chf', state);
    expect(result).toMatch(/weigh|weight|building/i);
  });

  it('returns null when no follow-up is needed', () => {
    const state = freshState();
    const result = generateSymptomFollowUp(['fatigue'], 'chf', state);
    expect(result).toBeNull();
  });
});

describe('generateQuestionResponse', () => {
  it('handles "is that normal" type questions', () => {
    const state = freshState();
    const result = generateQuestionResponse('is that normal?', 'chf', 'Maria', state);
    expect(result).toContain('Maria');
  });

  it('handles appointment questions', () => {
    const state = freshState();
    const result = generateQuestionResponse('when is my next appointment?', 'chf', 'Maria', state);
    expect(result).toMatch(/appointment|follow/i);
  });

  it('handles diet questions with CHF-specific advice', () => {
    const state = freshState();
    const result = generateQuestionResponse('what should I eat?', 'chf', 'Maria', state);
    expect(result).toMatch(/salt|sodium|fluid/i);
  });

  it('handles exercise questions', () => {
    const state = freshState();
    const result = generateQuestionResponse('can I walk more?', 'copd', 'James', state);
    expect(result).toMatch(/activity|exercise|walk/i);
  });

  it('gives generic answer for unrecognized questions', () => {
    const state = freshState();
    const result = generateQuestionResponse('random question?', 'chf', 'Maria', state);
    expect(result).toContain('Maria');
    expect(result).toMatch(/coordinator|care team/i);
  });
});

describe('generateCompletionMessage', () => {
  it('gives special message for day 1', () => {
    const state = freshState();
    const result = generateCompletionMessage('Maria', 1, state);
    expect(result).toMatch(/first/i);
    expect(result).toContain('Maria');
  });

  it('gives near-end message for day 28+', () => {
    const state = freshState();
    const result = generateCompletionMessage('Maria', 28, state);
    expect(result).toMatch(/almost|proud|end/i);
  });

  it('gives warning-aware message for yellow risk', () => {
    const state = freshState({ overallRisk: 'yellow' });
    const result = generateCompletionMessage('Maria', 10, state);
    expect(result).toMatch(/care team|coordinator|follow/i);
  });

  it('gives standard completion message for mid-program green', () => {
    const state = freshState();
    const result = generateCompletionMessage('Maria', 15, state);
    expect(result).toContain('Maria');
    expect(result).toMatch(/tomorrow/i);
  });
});
