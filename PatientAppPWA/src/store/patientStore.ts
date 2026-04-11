import { create } from 'zustand';
import type { PatientSession, TodayCheckin } from '../types';

interface PatientState {
  token: string | null;
  session: PatientSession | null;
  checkin: TodayCheckin | null;
  setSession: (token: string, session: PatientSession) => void;
  clearSession: () => void;
  setCheckin: (checkin: TodayCheckin) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  token: null,
  session: null,
  checkin: null,
  setSession: (token, session) => set({ token, session }),
  clearSession: () => set({ token: null, session: null, checkin: null }),
  setCheckin: (checkin) => set({ checkin }),
}));
