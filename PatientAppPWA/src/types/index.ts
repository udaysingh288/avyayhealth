/**
 * PatientAppPWA type definitions.
 * Structural interfaces come from @shared/types/patient.
 * Enum types are narrower than the dashboard apps (no 'not_started', no 'hip_knee'/'cabg').
 */

export type RiskLevel = 'red' | 'yellow' | 'green';
export type Condition = 'chf' | 'copd' | 'pneumonia' | 'ami';
export type CheckInStatus = 'pending' | 'completed' | 'missed' | 'escalated';

export type SDOHDomain =
  | 'food_insecurity'
  | 'housing_instability'
  | 'transportation'
  | 'utility_difficulty'
  | 'interpersonal_safety';

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  timing: string;
}

export interface PatientSession {
  patient_id: string;
  first_name: string;
  condition: Condition;
  discharge_date: string;
  days_in_program: number;
  total_days: number;
  hospital_name: string;
  coordinator_first_name: string;
  medications: Medication[];
  token: string;
}

export interface Message {
  id: string;
  role: 'ai' | 'patient' | 'coordinator';
  content: string;
  sent_at: string;
  risk_level: RiskLevel | null;
}

export interface TodayCheckin {
  checkin_id: string;
  day_number: number;
  status: CheckInStatus;
  question: string;
  conversation: Message[];
  completed_at: string | null;
}

export interface DayHistory {
  day_number: number;
  date: string;
  status: CheckInStatus;
  risk_level: RiskLevel | null;
  summary: string | null;
}

export interface SDOHResource {
  id: string;
  domain: SDOHDomain;
  name: string;
  description: string;
  phone: string | null;
  website: string | null;
  referral_made: boolean;
  referral_date: string | null;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
