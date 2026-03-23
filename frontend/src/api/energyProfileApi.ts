import api from "../users/utils/jwtUtil";

// === 요청 타입 ===

export interface EnergyProfileRequest {
  socialLoad: number;
  interactionMode: number;
  structureLevel: number;
  activityIntensity: number;
  commitmentLevel: number;
}

// === 응답 타입 ===

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

// === API ===

export const energyProfileApi = {
  // 에너지 프로필 최초 저장 (온보딩)
  create: (data: EnergyProfileRequest) =>
    api.post<EnergyProfileResponse>("/api/users/me/energy-profile/create", data),

  // 에너지 프로필 수정
  update: (data: EnergyProfileRequest) =>
    api.put<EnergyProfileResponse>("/api/users/me/energy-profile/update", data),

  // 내 에너지 프로필 조회
  check: () =>
    api.get<EnergyProfileResponse>("/api/users/me/energy-profile/check"),

  // 에너지 기반 서클 추천
  recommend: (limit: number = 5) =>
    api.post<RecommendationResponse[]>(
      `/api/users/me/energy-profile/recommend?limit=${limit}`
    ),
};
