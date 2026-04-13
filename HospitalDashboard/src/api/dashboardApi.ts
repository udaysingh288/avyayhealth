/**
 * Supabase queries and data transformation for the coordinator dashboard.
 *
 * Pure data layer — no React hooks, no state management.
 * Called by useDashboardData hook.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Patient, DashboardMetrics, Alert, CheckIn, RiskLevel } from '../types';

/**
 * Update a patient's risk_override column.
 * Pass null to clear the override and revert to AI-determined risk.
 */
export async function updatePatientRiskOverride(
  supabase: SupabaseClient,
  patientId: string,
  riskLevel: RiskLevel | null,
): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .update({ risk_override: riskLevel === 'not_started' ? null : riskLevel })
    .eq('id', patientId);
  if (error) throw error;
}

export interface DashboardSnapshot {
  patients: Patient[];
  metrics: DashboardMetrics;
  alerts: Alert[];
  checkinsMap: Record<string, CheckIn[]>;
}

export async function fetchDashboardData(
  supabase: SupabaseClient,
  hospitalId: string,
): Promise<DashboardSnapshot> {
  // Parallel fetch: patients, check_ins (with messages), sdoh_flags, unread DMs
  const [patientsRes, checkInsRes, sdohRes, unreadDmsRes] = await Promise.all([
    supabase
      .from('patients')
      .select('id, first_name, last_name, dob, condition, discharge_date, days_in_program, total_days, phone, status, coordinator_id, hospital_id, created_at, risk_override')
      .eq('hospital_id', hospitalId)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('check_ins')
      .select(`
        id, patient_id, day_number, date, status, risk_level, summary, completed_at, created_at,
        messages ( id, role, content, risk_level, sent_at )
      `)
      .order('day_number', { ascending: false }),
    supabase
      .from('sdoh_flags')
      .select('id, patient_id, domain, resolved'),
    supabase
      .from('direct_messages')
      .select('id, patient_id')
      .eq('sender_type', 'patient')
      .is('read_at', null),
  ]);

  if (patientsRes.error) throw patientsRes.error;

  const dbPatients = patientsRes.data ?? [];

  // Scope check-ins, SDOH flags, and DMs to this hospital's patients only
  const hospitalPatientIds = new Set(dbPatients.map((p: any) => p.id));
  const dbCheckIns = (checkInsRes.data ?? []).filter((ci: any) => hospitalPatientIds.has(ci.patient_id));
  const dbSdoh = (sdohRes.data ?? []).filter((f: any) => hospitalPatientIds.has(f.patient_id));

  // Count unread DMs per patient
  const unreadDmsByPatient = new Map<string, number>();
  for (const dm of (unreadDmsRes.data ?? [])) {
    if (!hospitalPatientIds.has(dm.patient_id)) continue;
    unreadDmsByPatient.set(dm.patient_id, (unreadDmsByPatient.get(dm.patient_id) ?? 0) + 1);
  }

  // Index check-ins by patient_id
  const checkinsByPatient = new Map<string, typeof dbCheckIns>();
  for (const ci of dbCheckIns) {
    const arr = checkinsByPatient.get(ci.patient_id) ?? [];
    arr.push(ci);
    checkinsByPatient.set(ci.patient_id, arr);
  }

  // Index SDOH flags by patient_id
  const sdohByPatient = new Map<string, string[]>();
  for (const flag of dbSdoh) {
    if (flag.resolved) continue;
    const arr = sdohByPatient.get(flag.patient_id) ?? [];
    arr.push(flag.domain);
    sdohByPatient.set(flag.patient_id, arr);
  }

  // Build Patient[]
  const patients: Patient[] = dbPatients.map((p) => {
    const patientCheckins = checkinsByPatient.get(p.id) ?? [];
    const latestCheckin = patientCheckins[0];
    const completedCount = patientCheckins.filter(
      (c) => c.status === 'completed' || c.status === 'escalated',
    ).length;
    const totalCheckins = Math.max(p.days_in_program, 1);

    let lastReply: string | null = null;
    let lastCheckinAt: string | null = null;
    if (latestCheckin) {
      const msgs = (latestCheckin as any).messages ?? [];
      const patientMsgs = msgs.filter((m: any) => m.role === 'patient');
      const lastMsg = patientMsgs[patientMsgs.length - 1];
      if (lastMsg) {
        lastReply = latestCheckin.summary ?? lastMsg.content;
        lastCheckinAt = lastMsg.sent_at;
      } else {
        lastCheckinAt = latestCheckin.created_at;
      }
    }

    let riskLevel: RiskLevel = 'not_started';
    if (p.risk_override) {
      // Coordinator manual override takes precedence
      riskLevel = p.risk_override as RiskLevel;
    } else if (latestCheckin?.risk_level) {
      riskLevel = latestCheckin.risk_level as RiskLevel;
    } else if (latestCheckin?.status === 'pending') {
      riskLevel = 'green';
    }

    let age = 0;
    if (p.dob) {
      const birth = new Date(p.dob);
      const now = new Date();
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    }

    return {
      id: p.id,
      first_name: p.first_name ?? '',
      last_name: p.last_name ?? '',
      age,
      sex: 'Other' as const,
      condition: p.condition as Patient['condition'],
      discharge_date: p.discharge_date,
      enrollment_date: p.created_at,
      days_in_program: p.days_in_program,
      risk_level: riskLevel,
      last_checkin_at: lastCheckinAt,
      last_reply_summary: lastReply,
      coordinator_id: p.coordinator_id ?? '',
      hospital_id: p.hospital_id,
      phone_last_four: p.phone ? p.phone.slice(-4) : '—',
      channel: 'app' as const,
      sdoh_flags: (sdohByPatient.get(p.id) ?? []) as Patient['sdoh_flags'],
      adi_national_rank: null,
      checkin_completion_rate: totalCheckins > 0 ? completedCount / totalCheckins : 0,
      is_active: true,
      unread_dm_count: unreadDmsByPatient.get(p.id) ?? 0,
    };
  });

  // Build metrics
  const redCount = patients.filter((p) => p.risk_level === 'red').length;
  const yellowCount = patients.filter((p) => p.risk_level === 'yellow').length;
  const greenCount = patients.filter((p) => p.risk_level === 'green').length;
  const notStartedCount = patients.filter((p) => p.risk_level === 'not_started').length;

  const totalCompletion = patients.reduce((a, p) => a + p.checkin_completion_rate, 0);
  const avgCompletion = patients.length > 0 ? totalCompletion / patients.length : 0;

  const today = new Date().toISOString().slice(0, 10);
  const todayCheckins = dbCheckIns.filter((c) => c.date === today);
  const todayResponded = todayCheckins.filter(
    (c) => c.status === 'completed' || c.status === 'escalated',
  ).length;
  const dailyResponseRate = patients.length > 0 ? todayResponded / patients.length : 0;

  // Escalated check-ins as alerts
  const escalated = dbCheckIns.filter((c) => c.status === 'escalated');
  const alerts: Alert[] = escalated.map((c) => {
    const patient = patients.find((p) => p.id === c.patient_id);
    return {
      id: c.id,
      patient_id: c.patient_id,
      patient_name: patient
        ? `${patient.last_name}, ${patient.first_name}`
        : 'Unknown',
      created_at: c.completed_at ?? c.created_at,
      risk_level: 'red' as const,
      reason: c.summary ?? 'Patient flagged as high risk',
      acknowledged: false,
      acknowledged_at: null,
      acknowledged_by: null,
      action_taken: null,
    };
  });

  // Build checkinsMap for detail panel
  const checkinsMap: Record<string, CheckIn[]> = {};
  for (const ci of dbCheckIns) {
    const msgs = (ci as any).messages ?? [];
    const patientMsgs = msgs.filter((m: any) => m.role === 'patient');
    const lastPatientMsg = patientMsgs[patientMsgs.length - 1];
    const imageMsgs = msgs.filter((m: any) => m.message_type === 'image');

    const entry: CheckIn = {
      id: ci.id,
      patient_id: ci.patient_id,
      sent_at: ci.created_at,
      replied_at: lastPatientMsg?.sent_at ?? null,
      patient_message: lastPatientMsg?.content ?? null,
      ai_summary: ci.summary,
      risk_level: (ci.risk_level as RiskLevel) ?? 'green',
      escalated: ci.status === 'escalated',
      escalation_reason: ci.status === 'escalated' ? ci.summary : null,
      sdoh_domain_screened: null,
      sdoh_response: null,
      image_storage_path: imageMsgs.length > 0 ? imageMsgs[0].image_storage_path : null,
      image_classification: imageMsgs.length > 0 ? imageMsgs[0].image_classification : null,
    };

    if (!checkinsMap[ci.patient_id]) checkinsMap[ci.patient_id] = [];
    checkinsMap[ci.patient_id].push(entry);
  }

  const sdohFlagsTotal = dbSdoh.filter((f) => !f.resolved).length;

  const metrics: DashboardMetrics = {
    total_active_patients: patients.length,
    red_count: redCount,
    yellow_count: yellowCount,
    green_count: greenCount,
    not_started_count: notStartedCount,
    daily_response_rate: dailyResponseRate,
    checkin_completion_rate: avgCompletion,
    sdoh_flags_today: sdohFlagsTotal,
    unacknowledged_alerts: alerts.length,
  };

  return { patients, metrics, alerts, checkinsMap };
}
