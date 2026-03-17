import { create } from 'zustand';
import type { AuthUser } from '../types/auth';

// JWT payload에서 userId claim 추출
function decodeUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId ? Number(payload.userId) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  userId: number | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const storedToken = localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userId: storedToken ? decodeUserId(storedToken) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  setAuth: (token, user) => {
    localStorage.setItem('accessToken', token);
    set({ token, user, userId: decodeUserId(token), isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({ token: null, user: null, userId: null, isAuthenticated: false });
  },
}));
