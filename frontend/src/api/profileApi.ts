import api from './axiosInstance';

export interface UserProfile {
  name: string;
  nickname: string;
  email: string;
  age: number;
  userGender: 'MALE' | 'FEMALE';
  birthDate: string;
  statusMessage: string | null;
}

export const profileApi = {
  getMyProfile: () =>
    api.get<UserProfile>('/api/users/me').then((r) => r.data),

  updateNickname: (nickname: string) =>
    api.put('/api/users/profile/nickname', { nickname }),

  updateStatusMessage: (statusMessage: string) =>
    api.put('/api/users/profile/status-message', { statusMessage }),

  checkNickname: (nickname: string) =>
    api.get('/api/users/profile/check-nickname', { params: { nickname } }),
};
