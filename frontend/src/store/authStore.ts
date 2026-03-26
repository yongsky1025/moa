import { create } from 'zustand';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import type { AuthUser, LoginRequest, SignUpRequest } from '../users/types/auth';

const ACCOUNT_STATUS_CODES = new Set(['ACCOUNT_WITHDRAWN', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED']);

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
  /** Redux isLoggedIn과 동일 — 기존 코드 호환용 별칭 */
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;

  // 동기 액션
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  clearError: () => void;
  setAuthFromOAuth: (user: AuthUser) => void;

  // 비동기 액션
  login: (req: LoginRequest) => Promise<AuthUser | null>;
  signup: (req: SignUpRequest) => Promise<string | null>;
  logout: () => Promise<void>;
  restoreAuth: () => Promise<void>;
}

const storedToken = localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userId: storedToken ? decodeUserId(storedToken) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoggedIn: !!storedToken,
  loading: false,
  error: null,

  setAuth: (token, user) => {
    localStorage.setItem('accessToken', token);
    set({
      token,
      user,
      userId: decodeUserId(token),
      isAuthenticated: true,
      isLoggedIn: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({
      token: null,
      user: null,
      userId: null,
      isAuthenticated: false,
      isLoggedIn: false,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  setAuthFromOAuth: (user) =>
    set({ user, isAuthenticated: true, isLoggedIn: true, loading: false, error: null }),

  login: async (req) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login(req);
      const token: string = res.data.accessToken;
      const user = res.data.user as AuthUser;
      get().setAuth(token, user);
      set({ loading: false });
      return user;
    } catch (err: unknown) {
      let message = '로그인 실패';
      if (isAxiosError(err)) {
        const errorCode = err.response?.data?.errorCode;
        if (errorCode && ACCOUNT_STATUS_CODES.has(errorCode)) {
          set({ loading: false });
          window.location.href = `/users/account-status?code=${errorCode}`;
          return null;
        }
        const msg = err.response?.data?.message;
        if (typeof msg === 'string' && msg.trim()) message = msg;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ loading: false, error: message });
      return null;
    }
  },

  signup: async (req) => {
    try {
      await authApi.signup(req);
      return null; // 성공
    } catch (err: unknown) {
      let message = '회원가입 실패';
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message;
        if (typeof msg === 'string' && msg.trim()) message = msg;
      } else if (err instanceof Error) {
        message = err.message;
      }
      return message; // 에러 메시지 반환
    }
  },

  logout: async () => {
    await authApi.logout();
    get().clearAuth();
  },

  restoreAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoggedIn: false });
      return;
    }
    try {
      // accessToken만으로 유저 정보 조회 (계정 상태도 JWT 필터에서 검증됨)
      // 비활성 계정이면 403 + errorCode → axios 인터셉터가 상태 페이지로 리다이렉트
      const res = await authApi.getMe();
      get().setAuth(token, res.data);

      // 소셜 로그인 후 추가정보 미완료 → social-signup 페이지로 리다이렉트
      if (!res.data.privacyAgreed && !window.location.pathname.startsWith('/users/social-signup')) {
        window.location.href = '/users/social-signup';
      }
    } catch {
      get().clearAuth();
    }
  },
}));
