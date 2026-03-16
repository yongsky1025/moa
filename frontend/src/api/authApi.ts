import api from './axiosInstance';
import type { AuthResponse, LoginRequest } from '../types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get<AuthResponse['user']>('/api/auth/me').then((r) => r.data),
};
