/** SDOH (Social Determinants of Health) constants — CMS 5-domain framework. */

import type { SDOHDomain } from '../types';

/** Days in the 30-day program when SDOH screening is performed. */
export const SDOH_SCREENING_DAYS = [3, 7, 14, 21, 28] as const;

/** All five CMS SDOH domains. */
export const SDOH_DOMAINS: readonly SDOHDomain[] = [
  'transportation',
  'food_insecurity',
  'housing_instability',
  'utility_difficulty',
  'interpersonal_safety',
] as const;

/** Human-readable labels for each SDOH domain. */
export const SDOH_DOMAIN_LABELS: Record<SDOHDomain, string> = {
  food_insecurity: 'Food Access',
  housing_instability: 'Housing Stability',
  transportation: 'Transportation',
  utility_difficulty: 'Utility Payments',
  interpersonal_safety: 'Personal Safety',
};

/** Which SDOH domain to screen on a given day (cycles through domains). */
export function sdohDomainForDay(dayNumber: number): SDOHDomain | null {
  const idx = SDOH_SCREENING_DAYS.indexOf(dayNumber as typeof SDOH_SCREENING_DAYS[number]);
  if (idx === -1) return null;
  return SDOH_DOMAINS[idx] ?? null;
}
