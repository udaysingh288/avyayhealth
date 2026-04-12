/**
 * Shared dashboard data context.
 *
 * Mounts once at Layout level so all child pages (Dashboard, Alerts, Reports,
 * Settings) share the same data + loading state. Prevents re-fetching and
 * loading-spinner flash when switching sidebar tabs.
 */

import { createContext, useContext } from 'react';
import { useDashboardData, type DashboardData } from '../hooks/useDashboardData';

const DashboardContext = createContext<DashboardData | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const data = useDashboardData();
  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useSharedDashboardData(): DashboardData {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useSharedDashboardData must be used within DashboardProvider');
  }
  return ctx;
}
