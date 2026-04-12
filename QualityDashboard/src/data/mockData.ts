// Mock dataset for the Quality Director dashboard.
// Later this will be replaced by live Supabase queries.

export interface CoordinatorPerf {
  id: string;
  name: string;
  role: string;
  activePatients: number;
  redAlerts: number;
  yellowWatch: number;
  avgResponseMinutes: number;
  completionRate: number; // 0-1
  slaCompliance: number; // 0-1
}

export interface EngagementPoint {
  date: string; // e.g. "Apr 1"
  responseRate: number; // 0-1
  completion: number; // 0-1
}

export interface ConditionBreakdown {
  condition: string;
  patients: number;
  readmissionRate: number; // 0-1
}

export const HOSPITAL = {
  name: 'Riverside Community Medical Center',
  beds: 312,
  annualMedicareRevenue: 210_000_000,
  activePatients: 47,
  programDays: 90,
};

export const COORDINATORS: CoordinatorPerf[] = [
  {
    id: 'c-1',
    name: 'Sarah Chen, RN',
    role: 'Senior Care Coordinator',
    activePatients: 18,
    redAlerts: 2,
    yellowWatch: 4,
    avgResponseMinutes: 14,
    completionRate: 0.86,
    slaCompliance: 0.94,
  },
  {
    id: 'c-2',
    name: 'Marcus Johnson, RN',
    role: 'Care Coordinator',
    activePatients: 15,
    redAlerts: 1,
    yellowWatch: 3,
    avgResponseMinutes: 22,
    completionRate: 0.79,
    slaCompliance: 0.87,
  },
  {
    id: 'c-3',
    name: 'Priya Patel, RN',
    role: 'Care Coordinator',
    activePatients: 14,
    redAlerts: 0,
    yellowWatch: 1,
    avgResponseMinutes: 9,
    completionRate: 0.91,
    slaCompliance: 0.98,
  },
];

export const ENGAGEMENT_SERIES: EngagementPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const d = new Date('2026-03-13');
    d.setDate(d.getDate() + i);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      responseRate: 0.62 + Math.sin(i / 3) * 0.08 + i * 0.003,
      completion: 0.55 + Math.sin(i / 4) * 0.1 + i * 0.004,
    };
  },
);

export const CONDITIONS: ConditionBreakdown[] = [
  { condition: 'Heart Failure', patients: 24, readmissionRate: 0.172 },
  { condition: 'COPD', patients: 18, readmissionRate: 0.205 },
  { condition: 'Pneumonia', patients: 5, readmissionRate: 0.14 },
];

export const SDOH_FLAGS = {
  transportation: 14,
  food_insecurity: 9,
  housing_instability: 4,
  utility_difficulty: 6,
  interpersonal_safety: 1,
};

// CMS reimbursement stack (2026 rates)
export const CMS_CODES = [
  { code: '99453', desc: 'RPM device setup (one-time)', amount: 21.71, cadence: 'one-time' },
  { code: '99454', desc: 'RPM device supply', amount: 52.11, cadence: '/month' },
  { code: '99457', desc: 'RPM management, first 20 min', amount: 51.77, cadence: '/month' },
  { code: '99458', desc: 'RPM management add-on 20 min', amount: 41.42, cadence: '/month' },
  { code: '99490', desc: 'CCM first 20 min', amount: 66.13, cadence: '/month' },
  { code: '99496', desc: 'TCM high complexity', amount: 298.0, cadence: '/discharge' },
] as const;

// HRRP penalty context
export const HRRP = {
  currentPenaltyRate: 0.005, // 0.5%
  annualMedicareRevenue: HOSPITAL.annualMedicareRevenue,
  currentAnnualPenalty: HOSPITAL.annualMedicareRevenue * 0.005,
  projectedReductionPct: 0.2, // 20% reduction in readmissions from program
};
