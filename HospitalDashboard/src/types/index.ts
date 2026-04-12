/**
 * Re-export bridge — types now live in @shared/types.
 * This file ensures existing imports within HospitalDashboard continue to work.
 */
export type { RiskLevel, Condition, SDOHDomain } from '@shared/types';
export type {
  Patient,
  CheckIn,
  Alert,
  Coordinator,
  DashboardMetrics,
  CoordinatorNote,
} from '@shared/types/dashboard';
