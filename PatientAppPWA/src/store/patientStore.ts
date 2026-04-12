import { create } from 'zustand';
import type { PatientSession, TodayCheckin } from '../types';

const STORAGE_KEY = 'avyay-patient-session';

function loadPersistedSession(): { token: string; session: PatientSession } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.session) return parsed;
  } catch { /* corrupt data — ignore */ }
  return null;
}

function persistSession(token: string, session: PatientSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, session }));
  } catch { /* storage full — ignore */ }
}

function clearPersistedSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

interface PatientState {
  token: string | null;
  session: PatientSession | null;
  checkin: TodayCheckin | null;
  setSession: (token: string, session: PatientSession) => void;
  clearSession: () => void;
  setCheckin: (checkin: TodayCheckin) => void;
}

const persisted = loadPersistedSession();

export const usePatientStore = create<PatientState>((set) => ({
  token: persisted?.token ?? null,
  session: persisted?.session ?? null,
  checkin: null,
  setSession: (token, session) => {
    persistSession(token, session);
    set({ token, session });
  },
  clearSession: () => {
    clearPersistedSession();
    set({ token: null, session: null, checkin: null });
  },
  setCheckin: (checkin) => set({ checkin }),
}));
