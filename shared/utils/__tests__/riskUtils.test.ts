import { describe, it, expect } from 'vitest';
import {
  riskSortOrder,
  conditionLabel,
  riskLabel,
  actionLabel,
} from '../riskUtils';

describe('riskSortOrder', () => {
  it('returns 0 for red (highest priority)', () => {
    expect(riskSortOrder('red')).toBe(0);
  });

  it('returns 1 for yellow', () => {
    expect(riskSortOrder('yellow')).toBe(1);
  });

  it('returns 2 for green', () => {
    expect(riskSortOrder('green')).toBe(2);
  });

  it('returns 3 for not_started', () => {
    expect(riskSortOrder('not_started')).toBe(3);
  });

  it('returns 99 for unknown risk values', () => {
    expect(riskSortOrder('unknown' as any)).toBe(99);
  });

  it('sorts correctly when used in Array.sort', () => {
    const risks = ['green', 'red', 'not_started', 'yellow'] as const;
    const sorted = [...risks].sort((a, b) => riskSortOrder(a) - riskSortOrder(b));
    expect(sorted).toEqual(['red', 'yellow', 'green', 'not_started']);
  });
});

describe('conditionLabel', () => {
  it('maps chf to Heart Failure', () => {
    expect(conditionLabel('chf')).toBe('Heart Failure');
  });

  it('maps copd to COPD', () => {
    expect(conditionLabel('copd')).toBe('COPD');
  });

  it('maps pneumonia to Pneumonia', () => {
    expect(conditionLabel('pneumonia')).toBe('Pneumonia');
  });

  it('maps ami to Heart Attack', () => {
    expect(conditionLabel('ami')).toBe('Heart Attack');
  });

  it('maps hip_knee to Hip/Knee', () => {
    expect(conditionLabel('hip_knee')).toBe('Hip/Knee');
  });

  it('maps cabg to CABG', () => {
    expect(conditionLabel('cabg')).toBe('CABG');
  });

  it('returns raw condition string for unknown conditions', () => {
    expect(conditionLabel('unknown_condition' as any)).toBe('unknown_condition');
  });
});

describe('riskLabel', () => {
  it('returns RED for red', () => {
    expect(riskLabel('red')).toBe('RED');
  });

  it('returns YELLOW for yellow', () => {
    expect(riskLabel('yellow')).toBe('YELLOW');
  });

  it('returns GREEN for green', () => {
    expect(riskLabel('green')).toBe('GREEN');
  });

  it('returns NOT STARTED for not_started', () => {
    expect(riskLabel('not_started')).toBe('NOT STARTED');
  });
});

describe('actionLabel', () => {
  it('returns "Call now" for red', () => {
    expect(actionLabel('red')).toBe('Call now');
  });

  it('returns "Follow up" for yellow', () => {
    expect(actionLabel('yellow')).toBe('Follow up');
  });

  it('returns "View" for green', () => {
    expect(actionLabel('green')).toBe('View');
  });

  it('returns "View" for not_started', () => {
    expect(actionLabel('not_started')).toBe('View');
  });
});
