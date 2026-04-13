/** Dashboard types used by HospitalDashboard and QualityDashboard. */

import type { RiskLevel, Condition, SDOHDomain } from './index';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  condition: Condition;
  discharge_date: string;
  enrollment_date: string;
  days_in_program: number;
  risk_level: RiskLevel;
  last_checkin_at: string | null;
  last_reply_summary: string | null;
  coordinator_id: string;
  hospital_id: string;
  phone_last_four: string;
  channel: 'sms' | 'app' | 'both';
  sdoh_flags: SDOHDomain[];
  adi_national_rank: number | null;
  checkin_completion_rate: number;
  is_active: boolean;
  unread_dm_count: number;
}

export interface ImageClassification {
  injury_type: string;
  description: string;
  risk_level: RiskLevel;
  recommendations: string;
  confidence: string;
}

export interface CheckIn {
  id: string;
  patient_id: string;
  sent_at: string;
  replied_at: string | null;
  patient_message: string | null;
  ai_summary: string | null;
  risk_level: RiskLevel;
  escalated: boolean;
  escalation_reason: string | null;
  sdoh_domain_screened: SDOHDomain | null;
  sdoh_response: string | null;
  image_storage_path?: string | null;
  image_classification?: ImageClassification | null;
}

export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  created_at: string;
  risk_level: 'red';
  reason: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  action_taken: string | null;
}

export interface Coordinator {
  id: string;
  display_name: string;
  email: string;
  hospital_id: string;
  hospital_name: string;
  role: 'coordinator' | 'supervisor' | 'admin';
}

export interface DashboardMetrics {
  total_active_patients: number;
  red_count: number;
  yellow_count: number;
  green_count: number;
  not_started_count: number;
  daily_response_rate: number;
  checkin_completion_rate: number;
  sdoh_flags_today: number;
  unacknowledged_alerts: number;
}

export interface CoordinatorNote {
  id: string;
  patient_id: string;
  coordinator_id: string;
  coordinator_name: string;
  note: string;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  patient_id: string;
  sender_type: 'patient' | 'coordinator';
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}
