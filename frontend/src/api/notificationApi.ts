import api from './axiosInstance';
import type { Notification } from '../types/notification';

export const notificationApi = {
  getAll: () =>
    api.get<Notification[]>('/api/notifications').then((r) => r.data),

  readOne: (id: number) => api.post(`/api/notifications/${id}/read`),

  readAll: () => api.post('/api/notifications/read-all'),
};
