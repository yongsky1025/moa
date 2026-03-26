import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../../store/authStore';
import type { AuthUser } from '../../types/auth';

const api = axios.create({
  withCredentials: true,
});

// 동시 401이 여러 개 올 때 refresh를 한 번만 호출하기 위한 락
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(token: string) {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue = [];
}

function rejectQueue(err: unknown) {
  refreshQueue.forEach(({ reject }) => reject(err));
  refreshQueue = [];
}

// 요청 전: access token 헤더에 추가
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 응답 실패: 401이면 토큰 갱신 후 재요청
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      url !== '/api/auth/refresh'
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 이미 refresh 중이면 완료될 때까지 대기 후 재시도
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const res = await api.post('/api/auth/refresh');
        const data = res.data as { accessToken: string; user?: AuthUser };
        const newToken = data.accessToken;

        localStorage.setItem('accessToken', newToken);
        if (data.user) {
          useAuthStore.getState().setAuth(newToken, data.user);
        }
        processQueue(newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        rejectQueue(refreshError);
        useAuthStore.getState().clearAuth();
        window.location.href =
          '/users/login?error=' +
          encodeURIComponent('로그인이 만료되었습니다. 다시 로그인해주세요.');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
