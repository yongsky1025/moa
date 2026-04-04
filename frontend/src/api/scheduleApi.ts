import api from './axiosInstance';
import type {
  ScheduleResponse,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  ScheduleMember,
  ScheduleReview,
  ScheduleReviewCreateRequest,
} from '../schedule/types/schedule';
export type { ScheduleResponse };
import type { TagCategoryGroup } from './placeApi';

export interface TagSuggestResult {
  id: number;
  name: string;
  categoryName: string;
}

export const scheduleApi = {
  // 일정 생성 시 사용할 태그 목록 (scheduleEnabled=true 카테고리만)
  getScheduleTags: () =>
    api.get<TagCategoryGroup[]>('/api/tags/grouped', { params: { scheduleEnabled: true } }),

  // 일정 목록 (서클 멤버만, from/to 날짜 필터 선택적)
  getSchedules: (circleId: number, params?: { from?: string; to?: string }) =>
    api.get<ScheduleResponse[]>(`/api/circles/${circleId}/schedules`, { params }),

  // 일정 상세 (서클 멤버만)
  getSchedule: (circleId: number, scheduleId: number) =>
    api.get<ScheduleResponse>(`/api/circles/${circleId}/schedules/${scheduleId}`),

  // 일정 참여자 목록
  getScheduleMembers: (circleId: number, scheduleId: number) =>
    api.get<ScheduleMember[]>(`/api/circles/${circleId}/schedules/${scheduleId}/members`),

  // 일정 생성
  createSchedule: (circleId: number, data: ScheduleCreateRequest) =>
    api.post<ScheduleResponse>(`/api/circles/${circleId}/schedules`, data),

  // 일정 수정 (생성자 또는 리더)
  updateSchedule: (circleId: number, scheduleId: number, data: ScheduleUpdateRequest) =>
    api.put<ScheduleResponse>(`/api/circles/${circleId}/schedules/${scheduleId}`, data),

  // 일정 삭제 (생성자 또는 리더)
  deleteSchedule: (circleId: number, scheduleId: number) =>
    api.delete<void>(`/api/circles/${circleId}/schedules/${scheduleId}`),

  // 일정 참여 (result: 'JOIN' | 'PENDING')
  joinSchedule: (circleId: number, scheduleId: number) =>
    api.post<{ result: 'JOIN' | 'PENDING' }>(`/api/circles/${circleId}/schedules/${scheduleId}/join`),

  // 승인 대기 멤버 목록 조회 (생성자 또는 리더만)
  getPendingMembers: (circleId: number, scheduleId: number) =>
    api.get<import('../schedule/types/schedule').ScheduleMember[]>(`/api/circles/${circleId}/schedules/${scheduleId}/members/pending`),

  // 승인 대기 멤버 승인
  approveMember: (circleId: number, scheduleId: number, scheduleMemberId: number) =>
    api.post<void>(`/api/circles/${circleId}/schedules/${scheduleId}/members/${scheduleMemberId}/approve`),

  // 승인 대기 멤버 거절
  rejectMember: (circleId: number, scheduleId: number, scheduleMemberId: number) =>
    api.delete<void>(`/api/circles/${circleId}/schedules/${scheduleId}/members/${scheduleMemberId}/reject`),

  // 일정 참여 취소
  cancelSchedule: (circleId: number, scheduleId: number) =>
    api.delete<void>(`/api/circles/${circleId}/schedules/${scheduleId}/join`),

  // 일정 생성자 위임 (생성자가 다른 참여자에게 위임하고 본인 참여 취소)
  delegateScheduleCreator: (circleId: number, scheduleId: number, scheduleMemberId: number) =>
    api.post<void>(`/api/circles/${circleId}/schedules/${scheduleId}/delegate-creator`, { scheduleMemberId }),

  // 제목+설명 기반 태그 추천
  suggestTags: (title: string, description: string) =>
    api.post<TagSuggestResult[]>('/api/tags/suggest', { title, description }),

  // 내가 참석한 일정 목록
  getMySchedules: (params?: { from?: string; to?: string }) =>
    api.get<ScheduleResponse[]>('/api/schedules/my', { params }),

  // 후기 작성
  createReview: (circleId: number, scheduleId: number, data: ScheduleReviewCreateRequest) =>
    api.post<ScheduleReview>(`/api/circles/${circleId}/schedules/${scheduleId}/reviews`, data),

  // 후기 목록 조회
  getReviews: (circleId: number, scheduleId: number) =>
    api.get<ScheduleReview[]>(`/api/circles/${circleId}/schedules/${scheduleId}/reviews`),

  // 후기 삭제
  deleteReview: (circleId: number, scheduleId: number, reviewId: number) =>
    api.delete<void>(`/api/circles/${circleId}/schedules/${scheduleId}/reviews/${reviewId}`),

  // 서클 후기 조회 (page/size 옵션)
  getCircleReviews: (circleId: number, params?: { page?: number; size?: number }) =>
    api.get<ScheduleReview[]>(`/api/circles/${circleId}/schedules/reviews`, { params }),
};

