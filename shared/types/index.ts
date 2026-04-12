/** Canonical type definitions shared across all Avyay Health apps. */

export type RiskLevel = 'red' | 'yellow' | 'green' | 'not_started';
export type Condition = 'chf' | 'copd' | 'pneumonia' | 'ami' | 'hip_knee' | 'cabg';
export type CheckInStatus = 'pending' | 'completed' | 'missed' | 'escalated';

export type SDOHDomain =
  | 'food_insecurity'
  | 'housing_instability'
  | 'transportation'
  | 'utility_difficulty'
  | 'interpersonal_safety';
