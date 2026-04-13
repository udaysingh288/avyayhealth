import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  friendlyDate,
  shortTime,
  fullDate,
  daysSinceDischarge,
  isPastDay,
} from '../dateUtils';

describe('friendlyDate', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date().toISOString();
    expect(friendlyDate(today)).toBe('Today');
  });

  it('returns formatted date for a past date', () => {
    expect(friendlyDate('2026-01-15T12:00:00Z')).toBe('January 15');
  });

  it('returns empty string for invalid date', () => {
    expect(friendlyDate('not-a-date')).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(friendlyDate('')).toBe('');
  });
});

describe('shortTime', () => {
  it('formats time correctly', () => {
    const result = shortTime('2026-03-15T14:30:00Z');
    // Result depends on timezone, but should be non-empty and contain AM/PM
    expect(result).toBeTruthy();
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M/);
  });

  it('returns empty string for invalid date', () => {
    expect(shortTime('garbage')).toBe('');
  });
});

describe('fullDate', () => {
  it('formats a full date correctly', () => {
    expect(fullDate('2026-03-15T12:00:00Z')).toBe('March 15, 2026');
  });

  it('returns empty string for invalid date', () => {
    expect(fullDate('not-valid')).toBe('');
  });
});

describe('daysSinceDischarge', () => {
  it('returns 0 for today', () => {
    const today = new Date().toISOString();
    expect(daysSinceDischarge(today)).toBe(0);
  });

  it('returns positive number for past discharge date', () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    expect(daysSinceDischarge(sevenDaysAgo.toISOString())).toBe(7);
  });

  it('returns 0 for future date (not negative)', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(daysSinceDischarge(tomorrow.toISOString())).toBe(0);
  });

  it('returns 0 for far future date', () => {
    expect(daysSinceDischarge('2099-01-01T00:00:00Z')).toBe(0);
  });

  it('returns 0 for invalid date', () => {
    expect(daysSinceDischarge('not-a-date')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(daysSinceDischarge('')).toBe(0);
  });
});

describe('isPastDay', () => {
  it('returns true for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isPastDay(yesterday.toISOString())).toBe(true);
  });

  it('returns false for today', () => {
    const today = new Date().toISOString();
    expect(isPastDay(today)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isPastDay(tomorrow.toISOString())).toBe(false);
  });

  it('returns true for a date far in the past', () => {
    expect(isPastDay('2020-01-01T00:00:00Z')).toBe(true);
  });

  it('returns false for invalid date', () => {
    expect(isPastDay('garbage')).toBe(false);
  });
});
