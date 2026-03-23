import api from './axiosInstance';
import authApi from '../users/utils/jwtUtil';

export interface UserProfile {
  name: string;
  publicId: string;
  nickname: string;
  email: string;
  age: number;
  userGender: 'MALE' | 'FEMALE';
  birthDate: string;
  statusMessage: string | null;
  profileImageUrl?: string | null;
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

export const energyProfileApi = {
  create: (data: EnergyProfileRequest) =>
    authApi.post<EnergyProfileResponse>('/api/users/me/energy-profile/create', data),

  update: (data: EnergyProfileRequest) =>
    authApi.put<EnergyProfileResponse>('/api/users/me/energy-profile/update', data),

  check: () =>
    authApi.get<EnergyProfileResponse>('/api/users/me/energy-profile/check'),

  recommend: (limit: number = 5) =>
    authApi.post<RecommendationResponse[]>(
      `/api/users/me/energy-profile/recommend?limit=${limit}`,
    ),
};
