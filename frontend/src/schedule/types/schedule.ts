export type ScheduleStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ScheduleResponse {
  scheduleId: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  maxMember: number;
  currentMember?: number;
  status: ScheduleStatus;
  location?: string;
  latitude?: number;
  longitude?: number;
  joined?: boolean;
}

export interface ScheduleCreateRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  maxMember: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export type ScheduleUpdateRequest = ScheduleCreateRequest;
