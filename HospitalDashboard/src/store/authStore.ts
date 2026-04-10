import { create } from 'zustand';
import type { Coordinator } from '../types';

interface AuthState {
  token: string | null;
  coordinator: Coordinator | null;
  setAuth: (token: string, coordinator: Coordinator) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  coordinator: null,
  setAuth: (token, coordinator) => set({ token, coordinator }),
  clearAuth: () => set({ token: null, coordinator: null }),
}));
