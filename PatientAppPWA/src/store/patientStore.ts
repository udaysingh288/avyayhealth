import { create } from 'zustand';
import type { PatientSession, TodayCheckin } from '../types';

/**
 * Patient session store — in-memory only.
 *
 * HIPAA: Patient tokens and session data (first_name, condition) must NEVER
 * be persisted to localStorage or sessionStorage. If the app is refreshed
 * or closed, the patient re-enters name + DOB to re-authenticate.
 * This is the intended UX for elderly patients on shared devices.
 */

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
