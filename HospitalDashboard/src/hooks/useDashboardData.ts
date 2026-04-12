import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  MOCK_PATIENTS,
  MOCK_METRICS,
  MOCK_ALERTS,
  MOCK_CHECKINS,
} from '../utils/mockData';
import type { Patient, DashboardMetrics, Alert, CheckIn } from '../types';
import { fetchDashboardData } from '../api/dashboardApi';

export interface DashboardData {
  patients: Patient[];
  metrics: DashboardMetrics;
  alerts: Alert[];
  checkinsMap: Record<string, CheckIn[]>;
  isMock: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MOCK_SNAPSHOT: DashboardData = {
  patients: MOCK_PATIENTS,
  metrics: MOCK_METRICS,
  alerts: MOCK_ALERTS,
  checkinsMap: MOCK_CHECKINS,
  isMock: true,
  loading: false,
  error: null,
  refetch: () => {},
};

export function useDashboardData(): DashboardData {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const [state, setState] = useState<DashboardData>({
    ...MOCK_SNAPSHOT,
    loading: true,
  });
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    // Wait for auth to finish before deciding
    if (authLoading) return;

    if (!hasSupabase || !supabase || !userId || !profile?.hospital_id) {
      setState({ ...MOCK_SNAPSHOT, refetch: () => {} });
      return;
    }

    // Prevent concurrent loads
    if (loadingRef.current) return;
    loadingRef.current = true;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const snapshot = await fetchDashboardData(supabase, profile.hospital_id);
      setState({
        ...snapshot,
        isMock: false,
        loading: false,
        error: null,
        refetch: () => {},
      });
    } catch (err) {
      setState({
        ...MOCK_SNAPSHOT,
        loading: false,
        error: err instanceof Error ? err.message : 'Load failed',
        refetch: () => {},
      });
    } finally {
      loadingRef.current = false;
    }
  }, [userId, profile?.hospital_id, authLoading]);

  // Load when auth state settles or profile changes
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!hasSupabase || !userId || !profile?.hospital_id) return;
    const interval = setInterval(load, 120_000);
    return () => clearInterval(interval);
  }, [load, userId, profile?.hospital_id]);

  // Realtime: re-fetch when check_ins or patients change
  useEffect(() => {
    if (!hasSupabase || !supabase || !userId || !profile?.hospital_id) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'check_ins' },
        () => load(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        () => load(),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [load, userId, profile?.hospital_id]);

  return { ...state, refetch: load };
}
