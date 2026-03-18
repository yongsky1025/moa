import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
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

// 요청 인터셉터: accessToken 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 시 토큰 갱신 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // 이미 refresh 중이면 완료될 때까지 대기 후 재시도
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post('/api/auth/refresh', null, { withCredentials: true });
        const newToken: string = res.data.accessToken;
        const user = res.data.user;
        localStorage.setItem('accessToken', newToken);
        if (user) useAuthStore.getState().setAuth(newToken, user);
        processQueue(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        rejectQueue(refreshError);
        useAuthStore.getState().clearAuth();
        window.location.href = '/users/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
