import { describe, it, expect } from 'vitest';
import {
  SDOH_SCREENING_DAYS,
  SDOH_DOMAINS,
  SDOH_DOMAIN_LABELS,
  sdohDomainForDay,
} from '../sdoh';

describe('SDOH_SCREENING_DAYS', () => {
  it('has exactly 5 screening days', () => {
    expect(SDOH_SCREENING_DAYS).toHaveLength(5);
  });

  it('contains the correct days', () => {
    expect([...SDOH_SCREENING_DAYS]).toEqual([3, 7, 14, 21, 28]);
  });
});

describe('SDOH_DOMAINS', () => {
  it('has exactly 5 domains matching CMS framework', () => {
    expect(SDOH_DOMAINS).toHaveLength(5);
  });

  it('contains all CMS domains', () => {
    expect(SDOH_DOMAINS).toContain('transportation');
    expect(SDOH_DOMAINS).toContain('food_insecurity');
    expect(SDOH_DOMAINS).toContain('housing_instability');
    expect(SDOH_DOMAINS).toContain('utility_difficulty');
    expect(SDOH_DOMAINS).toContain('interpersonal_safety');
  });
});

describe('SDOH_DOMAIN_LABELS', () => {
  it('maps every domain to a human-readable label', () => {
    expect(SDOH_DOMAIN_LABELS.transportation).toBe('Transportation');
    expect(SDOH_DOMAIN_LABELS.food_insecurity).toBe('Food Access');
    expect(SDOH_DOMAIN_LABELS.housing_instability).toBe('Housing Stability');
    expect(SDOH_DOMAIN_LABELS.utility_difficulty).toBe('Utility Payments');
    expect(SDOH_DOMAIN_LABELS.interpersonal_safety).toBe('Personal Safety');
  });
});

describe('sdohDomainForDay', () => {
  it('returns correct domain for each screening day', () => {
    expect(sdohDomainForDay(3)).toBe('transportation');
    expect(sdohDomainForDay(7)).toBe('food_insecurity');
    expect(sdohDomainForDay(14)).toBe('housing_instability');
    expect(sdohDomainForDay(21)).toBe('utility_difficulty');
    expect(sdohDomainForDay(28)).toBe('interpersonal_safety');
  });

  it('returns null for non-screening days', () => {
    expect(sdohDomainForDay(1)).toBeNull();
    expect(sdohDomainForDay(2)).toBeNull();
    expect(sdohDomainForDay(4)).toBeNull();
    expect(sdohDomainForDay(10)).toBeNull();
    expect(sdohDomainForDay(15)).toBeNull();
    expect(sdohDomainForDay(30)).toBeNull();
  });

  it('returns null for boundary values', () => {
    expect(sdohDomainForDay(0)).toBeNull();
    expect(sdohDomainForDay(-1)).toBeNull();
    expect(sdohDomainForDay(31)).toBeNull();
    expect(sdohDomainForDay(100)).toBeNull();
  });
});
