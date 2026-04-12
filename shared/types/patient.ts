/**
 * Patient-facing types used by PatientAppPWA.
 *
 * These types use string literals directly instead of importing RiskLevel/Condition
 * from the shared index, because the patient app uses a narrower set of values
 * (no 'not_started' risk, no 'hip_knee'/'cabg' conditions).
 */

export interface PatientSession {
  patient_id: string;
  first_name: string;
  condition: string;
  discharge_date: string;
  days_in_program: number;
  total_days: number;
  hospital_name: string;
  coordinator_first_name: string;
  token: string;
}

export interface Message {
  id: string;
  role: 'ai' | 'patient';
  content: string;
  sent_at: string;
  risk_level: string | null;
}

export interface TodayCheckin {
  checkin_id: string;
  day_number: number;
  status: string;
  question: string;
  conversation: Message[];
  completed_at: string | null;
}

export interface DayHistory {
  day_number: number;
  date: string;
  status: string;
  risk_level: string | null;
  summary: string | null;
}

export interface SDOHResource {
  id: string;
  domain: string;
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
