import api from '../users/utils/jwtUtil';
import type {
  ScheduleResponse,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  ScheduleMember,
} from '../schedule/types/schedule';

export const scheduleApi = {
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

  // 일정 참여
  joinSchedule: (circleId: number, scheduleId: number) =>
    api.post<void>(`/api/circles/${circleId}/schedules/${scheduleId}/join`),

  // 일정 참여 취소
  cancelSchedule: (circleId: number, scheduleId: number) =>
    api.delete<void>(`/api/circles/${circleId}/schedules/${scheduleId}/join`),
};

