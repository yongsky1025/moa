import api from './axiosInstance';
import type {
  CircleResponse,
  CircleCreateRequest,
  CircleUpdateRequest,
  CircleMember,
  PageResult,
  RecommendationBundle,
} from '../circle/types/circle';
import type { CircleMemberStatus } from '../circle/types/circle';
import { requestUploadUrl, uploadByContract } from './uploadUrlApi';

export const circleApi = {
  // 카테고리 전체 목록
  getCategories: () =>
    api.get<{ categoryId: number; categoryName: string }[]>('/api/circles/categories'),

  // 서클 목록 (categoryIds 없으면 전체)
  getCircles: (params?: { categoryIds?: number[]; page?: number; size?: number; keyword?: string; type?: string }) =>
    api.get<PageResult<CircleResponse>>('/api/circles', {
      params,
      paramsSerializer: (p: typeof params) => {
        const sp = new URLSearchParams();
        p?.categoryIds?.forEach((id) => sp.append('categoryIds', String(id)));
        if (p?.page != null) sp.append('page', String(p.page));
        if (p?.size != null) sp.append('size', String(p.size));
        if (p?.keyword) sp.append('keyword', p.keyword);
        if (p?.type) sp.append('type', p.type);
        return sp.toString();
      },
    }),

  // 내가 가입한 서클
  getMyCircles: () =>
    api.get<CircleResponse[]>('/api/circles/me'),

  // 내가 좋아요한 서클
  getLikedCircles: () =>
    api.get<CircleResponse[]>('/api/circles/me/liked'),

  // 추천 서클 번들 (에너지 프로필 기반 — 5축/사회/활동 3가지 기준)
  getRecommendationBundle: (limit = 5) =>
    api.post<RecommendationBundle>('/api/users/me/energy-profile/recommend', null, { params: { limit } }),

  // 서클 상세
  getCircle: (circleId: number) =>
    api.get<CircleResponse>(`/api/circles/${circleId}`),

  // 서클 생성 (multipart/form-data)
  createCircle: (data: CircleCreateRequest, imageFile?: File) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile);
    return api.post<CircleResponse>('/api/circles', formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  // 서클 수정 (JSON, PUT multipart는 Tomcat 미지원)
  updateCircle: (circleId: number, data: CircleUpdateRequest) =>
    api.put<CircleResponse>(`/api/circles/${circleId}`, data),

  // 서클 대표 이미지 업로드/교체 (POST multipart)
  uploadCoverImage: async (circleId: number, imageFile: File) => {
    const metadata = await requestUploadUrl({
      domain: 'circle',
      fileName: imageFile.name,
      contentType: imageFile.type || 'application/octet-stream',
    });

    await uploadByContract(metadata, imageFile);

    return api.post<CircleResponse>(`/api/circles/${circleId}/image-url`, {
      fileUrl: metadata.fileUrl,
    });
  },

  // 서클 삭제
  deleteCircle: (circleId: number) =>
    api.delete<void>(`/api/circles/${circleId}`),

  // 가입 신청
  joinCircle: (circleId: number) =>
    api.post<void>(`/api/circles/${circleId}/members`),

  // ACTIVE 멤버 목록 (공개)
  getActiveMembers: (circleId: number, params?: { page?: number; size?: number }) =>
    api.get<PageResult<CircleMember>>(`/api/circles/${circleId}/members/active`, { params }),

  // 전체 멤버 목록 (리더 전용, status 없으면 전체)
  getMembers: (circleId: number, params?: { status?: CircleMemberStatus; page?: number; size?: number }) =>
    api.get<PageResult<CircleMember>>(`/api/circles/${circleId}/members`, { params }),

  // 멤버 상태 변경 (승인/거절)
  updateMemberStatus: (circleId: number, memberId: number, status: CircleMemberStatus) =>
    api.patch<void>(`/api/circles/${circleId}/members/${memberId}`, { status }),

  // 멤버 강퇴 (리더 전용)
  kickMember: (circleId: number, memberId: number) =>
    api.delete<void>(`/api/circles/${circleId}/members/${memberId}`),

  // 서클 탈퇴
  leaveCircle: (circleId: number) =>
    api.delete<void>(`/api/circles/${circleId}/members`),

  // 리더 권한 위임
  delegateLeader: (circleId: number, memberId: number) =>
    api.post<void>(`/api/circles/${circleId}/members/${memberId}/delegate`),

  // 좋아요 토글
  toggleCircleLike: (circleId: number) =>
    api.post<{ circleId: number; liked: boolean; likeCount: number }>(`/api/circles/${circleId}/like`),

  // 좋아요 상태 조회
  getCircleLikeStatus: (circleId: number) =>
    api.get<{ circleId: number; liked: boolean; likeCount: number }>(`/api/circles/${circleId}/like`),
};


