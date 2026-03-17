import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const api = axios.create({
  withCredentials: true,
});

// 요청 전: access token 헤더에 추가
const beforeReq = (config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

// 요청 실패
const requestFail = (error: AxiosError) => {
  console.log('request error');
  return Promise.reject(error);
};

// 응답 전: 정상 응답 그대로 반환
const beforeRes = (response: AxiosResponse) => {
  return response;
};

// 응답 실패: 401이면 토큰 갱신 후 재요청
const responseFail = async (error: AxiosError) => {
  const originalRequest = error.config;

  if (
    error.response?.data === 'ERROR_ACCESS_TOKEN' &&
    originalRequest &&
    !(originalRequest as unknown as Record<string, unknown>)._retry
  ) {
    (originalRequest as unknown as Record<string, unknown>)._retry = true;

    try {
      const res = await api.post('/api/auth/refresh');
      const accessToken: string = res.data.accessToken;
      localStorage.setItem('accessToken', accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
      return Promise.reject(error);
    }
  }

  return Promise.reject(error);
};

api.interceptors.request.use(beforeReq, requestFail);
api.interceptors.response.use(beforeRes, responseFail);

export default api;
