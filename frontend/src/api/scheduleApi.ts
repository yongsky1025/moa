import api from './axiosInstance';
import type {
  ScheduleResponse,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
} from '../schedule/types/schedule';

export const scheduleApi = {
  // 일정 목록 (서클 멤버만)
  getSchedules: (circleId: number) =>
    api.get<ScheduleResponse[]>(`/circles/${circleId}/schedules`),

  // 일정 상세 (서클 멤버만)
  getSchedule: (circleId: number, scheduleId: number) =>
    api.get<ScheduleResponse>(`/circles/${circleId}/schedules/${scheduleId}`),

  // 일정 생성
  createSchedule: (circleId: number, data: ScheduleCreateRequest) =>
    api.post<ScheduleResponse>(`/circles/${circleId}/schedules`, data),

  // 일정 수정 (생성자 또는 리더)
  updateSchedule: (circleId: number, scheduleId: number, data: ScheduleUpdateRequest) =>
    api.put<ScheduleResponse>(`/circles/${circleId}/schedules/${scheduleId}`, data),

  // 일정 삭제 (생성자 또는 리더)
  deleteSchedule: (circleId: number, scheduleId: number) =>
    api.delete<void>(`/circles/${circleId}/schedules/${scheduleId}`),

  // 일정 참여
  joinSchedule: (circleId: number, scheduleId: number) =>
    api.post<void>(`/circles/${circleId}/schedules/${scheduleId}/join`),

  // 일정 참여 취소
  cancelSchedule: (circleId: number, scheduleId: number) =>
    api.delete<void>(`/circles/${circleId}/schedules/${scheduleId}/join`),
};
