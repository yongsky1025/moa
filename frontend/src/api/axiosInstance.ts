import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

// 동시 401이 여러 개 올 때 refresh를 한 번만 호출하기 위한
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
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData는 브라우저가 multipart boundary를 직접 붙이게 함
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

const ACCOUNT_STATUS_CODES = new Set(["ACCOUNT_WITHDRAWN", "ACCOUNT_SUSPENDED", "ACCOUNT_BANNED"]);

// 응답 인터셉터: 403 계정 상태 / 401 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 계정 상태 에러 → 경고 페이지로 리다이렉트
    const errorCode = error.response?.data?.errorCode;
    if (error.response?.status === 403 && errorCode && ACCOUNT_STATUS_CODES.has(errorCode)) {
      useAuthStore.getState().clearAuth();
      window.location.href = `/users/account-status?code=${errorCode}`;
      return Promise.reject(error);
    }

    const original = error.config;
    const url = original?.url ?? "";
    if (error.response?.status === 401 && !original._retry && url !== "/api/auth/refresh") {
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
        const res = await axios.post("/api/auth/refresh", null, { withCredentials: true });
        const newToken: string = res.data.accessToken;
        const user = res.data.user;

        localStorage.setItem("accessToken", newToken);
        if (user) useAuthStore.getState().setAuth(newToken, user);

        processQueue(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError: unknown) {
        rejectQueue(refreshError);

        // refresh 실패 시에도 계정 상태 에러코드 확인
        const refreshErrCode = (refreshError as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
        useAuthStore.getState().clearAuth();

        if (refreshErrCode && ACCOUNT_STATUS_CODES.has(refreshErrCode)) {
          window.location.href = `/users/account-status?code=${refreshErrCode}`;
        } else {
          window.location.href = "/users/login";
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
