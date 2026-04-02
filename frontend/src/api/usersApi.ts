import api from './axiosInstance';

export interface UserProfile {
  name: string;
  publicId: string;
  nickname: string;
  email: string;
  provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER' | null;
  age: number;
  userGender: 'MALE' | 'FEMALE';
  birthDate: string;
  statusMessage: string | null;
  profileImageUrl?: string | null;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface EnergyProfileRequest {
  socialLoad: number;
  interactionMode: number;
  structureLevel: number;
  activityIntensity: number;
  commitmentLevel: number;
}

export interface EnergyProfileResponse {
  profileId: number;
  socialLoad: number;
  interactionMode: number;
  structureLevel: number;
  activityIntensity: number;
  commitmentLevel: number;
  energyTypeName: string;
  energyTypeDescription: string;
  recommendedCategories: string;
}

export interface RecommendationResponse {
  circleId: number;
  name: string;
  description: string;
  categoryName: string;
  similarity: number;
  reason: string | null;
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

export const accountApi = {
  changePassword: (data: PasswordChangeRequest) =>
    api.post('/api/users/account/password', data),

  withdraw: (password: string) =>
    api.post('/api/users/account/withdraw', { password }),
};

export const energyProfileApi = {
  create: (data: EnergyProfileRequest) =>
    api.post<EnergyProfileResponse>('/api/users/me/energy-profile/create', data),

  update: (data: EnergyProfileRequest) =>
    api.put<EnergyProfileResponse>('/api/users/me/energy-profile/update', data),

  check: () =>
    api.get<EnergyProfileResponse>('/api/users/me/energy-profile/check'),

  recommend: (limit: number = 5) =>
    api.post<RecommendationResponse[]>(
      `/api/users/me/energy-profile/recommend?limit=${limit}`,
    ),
};
