import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  HOSPITAL as MOCK_HOSPITAL,
  COORDINATORS as MOCK_COORDINATORS,
  CONDITIONS as MOCK_CONDITIONS,
  SDOH_FLAGS as MOCK_SDOH,
  type CoordinatorPerf,
  type ConditionBreakdown,
} from '../data/mockData';
import { fetchHospitalData, type HospitalMeta } from '../api/hospitalApi';

export type { HospitalMeta };

export interface HospitalData {
  hospital: HospitalMeta;
  coordinators: CoordinatorPerf[];
  conditions: ConditionBreakdown[];
  sdohFlags: Record<string, number>;
  isMock: boolean;
  loading: boolean;
  error: string | null;
}

const MOCK_SNAPSHOT: HospitalData = {
  hospital: MOCK_HOSPITAL,
  coordinators: MOCK_COORDINATORS,
  conditions: MOCK_CONDITIONS,
  sdohFlags: MOCK_SDOH,
  isMock: true,
  loading: false,
  error: null,
};

export function useHospitalData(): HospitalData {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.userId);
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<HospitalData>({
    ...MOCK_SNAPSHOT,
    loading: hasSupabase && !!userId,
  });

  useEffect(() => {
    if (!hasSupabase || !supabase || !userId || !profile?.hospital_id) {
      setState(MOCK_SNAPSHOT);
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    async function load() {
      try {
        const snapshot = await fetchHospitalData(supabase!, profile!.hospital_id!);
        if (cancelled) return;

        setState({
          ...snapshot,
          isMock: false,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          ...MOCK_SNAPSHOT,
          loading: false,
          error: err instanceof Error ? err.message : 'Load failed',
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, profile?.hospital_id, refreshKey]);

  // Realtime: bump refreshKey when patient data changes
  useEffect(() => {
    if (!hasSupabase || !supabase || !userId || !profile?.hospital_id) return;

    const channel = supabase
      .channel('quality-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        () => setRefreshKey((k) => k + 1),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'check_ins' },
        () => setRefreshKey((k) => k + 1),
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [userId, profile?.hospital_id]);

  return state;
}
