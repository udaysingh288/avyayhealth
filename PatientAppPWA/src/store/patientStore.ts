import { create } from 'zustand';
import type { PatientSession } from '../types';

interface PatientState {
  token: string | null;
  session: PatientSession | null;
  setSession: (token: string, session: PatientSession) => void;
  clearSession: () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  token: null,
  session: null,
  setSession: (token, session) => set({ token, session }),
  clearSession: () => set({ token: null, session: null }),
}));
