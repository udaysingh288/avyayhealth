import { create } from 'zustand';

export interface Profile {
  id: string;
  hospital_id: string | null;
  role: 'care_coordinator' | 'quality_director' | 'admin';
  display_name: string | null;
}

interface AuthState {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  loading: boolean;
  setAuth: (u: { userId: string; email: string; profile: Profile | null }) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  profile: null,
  loading: true,
  setAuth: ({ userId, email, profile }) =>
    set({ userId, email, profile, loading: false }),
  clearAuth: () =>
    set({ userId: null, email: null, profile: null, loading: false }),
  setLoading: (v) => set({ loading: v }),
}));
