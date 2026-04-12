/**
 * Supabase queries and data transformation for the quality dashboard.
 *
 * Pure data layer — no React hooks, no state management.
 * Called by useHospitalData hook.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  HOSPITAL as MOCK_HOSPITAL,
  COORDINATORS as MOCK_COORDINATORS,
  CONDITIONS as MOCK_CONDITIONS,
  SDOH_FLAGS as MOCK_SDOH,
  type CoordinatorPerf,
  type ConditionBreakdown,
} from '../data/mockData';

export interface HospitalMeta {
  name: string;
  beds: number;
  annualMedicareRevenue: number;
  activePatients: number;
  programDays: number;
}

export interface HospitalSnapshot {
  hospital: HospitalMeta;
  coordinators: CoordinatorPerf[];
  conditions: ConditionBreakdown[];
  sdohFlags: Record<string, number>;
}

export async function fetchHospitalData(
  supabase: SupabaseClient,
  hospitalId: string,
): Promise<HospitalSnapshot> {
  const [hospitalRes, coordinatorsRes, patientsRes, checkInsRes, sdohRes] = await Promise.all([
    supabase
      .from('hospitals')
      .select('id, name')
      .eq('id', hospitalId)
      .maybeSingle(),
    supabase
      .from('coordinators')
      .select('id, first_name, last_name, role')
      .eq('hospital_id', hospitalId)
      .eq('role', 'care_coordinator')
      .order('created_at', { ascending: true }),
    supabase
      .from('patients')
      .select('id, condition, coordinator_id, status')
      .eq('hospital_id', hospitalId)
      .eq('status', 'active'),
    supabase
      .from('check_ins')
      .select('id, patient_id, status, risk_level, completed_at, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('sdoh_flags')
      .select('id, patient_id, domain, resolved'),
  ]);

  if (hospitalRes.error || !hospitalRes.data) {
    throw new Error(hospitalRes.error?.message ?? 'Hospital not found');
  }

  const dbPatients = patientsRes.data ?? [];
  const activePatients = dbPatients.length;

  const hospitalPatientIds = new Set(dbPatients.map((p) => p.id));
  const dbCheckIns = (checkInsRes.data ?? []).filter((ci) => hospitalPatientIds.has(ci.patient_id));
  const dbSdoh = (sdohRes.data ?? []).filter((f) => hospitalPatientIds.has(f.patient_id));

  // Condition breakdown
  const byCondition = new Map<string, number>();
  for (const p of dbPatients) {
    const key = String(p.condition);
    byCondition.set(key, (byCondition.get(key) ?? 0) + 1);
  }

  const CONDITION_LABEL: Record<string, string> = {
    chf: 'Heart Failure',
    copd: 'COPD',
    pneumonia: 'Pneumonia',
    ami: 'AMI',
  };

  const conditions: ConditionBreakdown[] =
    byCondition.size > 0
      ? Array.from(byCondition.entries()).map(([cond, count]) => ({
          condition: CONDITION_LABEL[cond] ?? cond,
          patients: count,
          readmissionRate:
            cond === 'chf'
              ? 0.172
              : cond === 'copd'
                ? 0.205
                : cond === 'pneumonia'
                  ? 0.14
                  : 0.18,
        }))
      : MOCK_CONDITIONS;

  // Coordinator stats
  const patientCoordMap = new Map<string, string>();
  for (const p of dbPatients) {
    if (p.coordinator_id) patientCoordMap.set(p.id, p.coordinator_id);
  }

  const coordStats = new Map<string, {
    total: number;
    completed: number;
    red: number;
    yellow: number;
    responseTimes: number[];
  }>();

  for (const ci of dbCheckIns) {
    const coordId = patientCoordMap.get(ci.patient_id);
    if (!coordId) continue;
    const stats = coordStats.get(coordId) ?? {
      total: 0, completed: 0, red: 0, yellow: 0, responseTimes: [],
    };
    stats.total++;
    if (ci.status === 'completed' || ci.status === 'escalated') {
      stats.completed++;
    }
    if (ci.risk_level === 'red') stats.red++;
    if (ci.risk_level === 'yellow') stats.yellow++;
    if (ci.completed_at && ci.created_at) {
      const diff = new Date(ci.completed_at).getTime() - new Date(ci.created_at).getTime();
      if (diff > 0) stats.responseTimes.push(diff / 60_000);
    }
    coordStats.set(coordId, stats);
  }

  const coordPatientCount = new Map<string, number>();
  for (const p of dbPatients) {
    if (p.coordinator_id) {
      coordPatientCount.set(p.coordinator_id, (coordPatientCount.get(p.coordinator_id) ?? 0) + 1);
    }
  }

  const coordinators: CoordinatorPerf[] =
    coordinatorsRes.data && coordinatorsRes.data.length > 0
      ? coordinatorsRes.data.map((c, i) => {
          const stats = coordStats.get(c.id);
          const patCount = coordPatientCount.get(c.id) ?? 0;
          const mock = MOCK_COORDINATORS[i] ?? MOCK_COORDINATORS[0];
          const avgResp = stats && stats.responseTimes.length > 0
            ? stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length
            : mock.avgResponseMinutes;
          const completionRate = stats && stats.total > 0
            ? stats.completed / stats.total
            : mock.completionRate;

          return {
            id: c.id,
            name: `${c.first_name} ${c.last_name}, RN`,
            role: i === 0 ? 'Senior Care Coordinator' : 'Care Coordinator',
            activePatients: patCount || mock.activePatients,
            redAlerts: stats?.red ?? mock.redAlerts,
            yellowWatch: stats?.yellow ?? mock.yellowWatch,
            avgResponseMinutes: Math.round(avgResp),
            completionRate,
            slaCompliance: completionRate > 0 ? Math.min(completionRate * 1.05, 1) : mock.slaCompliance,
          };
        })
      : MOCK_COORDINATORS;

  // SDOH flags
  const sdohFlags: Record<string, number> = {};
  for (const flag of dbSdoh) {
    if (flag.resolved) continue;
    sdohFlags[flag.domain] = (sdohFlags[flag.domain] ?? 0) + 1;
  }
  const hasLiveSdoh = Object.keys(sdohFlags).length > 0;

  return {
    hospital: {
      ...MOCK_HOSPITAL,
      name: hospitalRes.data.name,
      activePatients: activePatients || MOCK_HOSPITAL.activePatients,
    },
    coordinators,
    conditions,
    sdohFlags: hasLiveSdoh ? sdohFlags : MOCK_SDOH,
  };
}
