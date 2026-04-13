import { describe, it, expect } from 'vitest';
import { relativeTime, shortDate, timeStamp, dayOfProgram } from '../dateUtils';

describe('relativeTime', () => {
  it('returns "Never" for null', () => {
    expect(relativeTime(null)).toBe('Never');
  });

  it('returns a relative time string for a recent ISO date', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = relativeTime(fiveMinAgo);
    expect(result).toContain('ago');
  });

  it('returns dash for invalid date string', () => {
    expect(relativeTime('garbage')).toBe('—');
  });

  it('returns "Never" for empty string (falsy)', () => {
    expect(relativeTime('')).toBe('Never');
  });
});

describe('shortDate', () => {
  it('formats a date correctly', () => {
    expect(shortDate('2026-03-15T12:00:00Z')).toBe('Mar 15, 2026');
  });

  it('formats another date correctly', () => {
    expect(shortDate('2026-01-01T12:00:00Z')).toBe('Jan 1, 2026');
  });

  it('returns dash for invalid date', () => {
    expect(shortDate('not-a-date')).toBe('—');
  });
});

describe('timeStamp', () => {
  it('formats date and time correctly', () => {
    const result = timeStamp('2026-03-15T14:30:00Z');
    expect(result).toBeTruthy();
    // Result depends on timezone but should contain month and time
    expect(result).toMatch(/Mar 15/);
  });

  it('returns dash for invalid date', () => {
    expect(timeStamp('invalid')).toBe('—');
  });
});

describe('dayOfProgram', () => {
  it('returns "Day 1 of 30" for 0 or negative', () => {
    expect(dayOfProgram(0)).toBe('Day 1 of 30');
    expect(dayOfProgram(-1)).toBe('Day 1 of 30');
    expect(dayOfProgram(-100)).toBe('Day 1 of 30');
  });

  it('returns correct day for mid-program', () => {
    expect(dayOfProgram(15)).toBe('Day 15 of 30');
    expect(dayOfProgram(1)).toBe('Day 1 of 30');
    expect(dayOfProgram(29)).toBe('Day 29 of 30');
  });

  it('caps at "Day 30 of 30" for values >= 30', () => {
    expect(dayOfProgram(30)).toBe('Day 30 of 30');
    expect(dayOfProgram(31)).toBe('Day 30 of 30');
    expect(dayOfProgram(100)).toBe('Day 30 of 30');
  });
});
