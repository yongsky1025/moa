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
  tags?: string[];
  chatRoomId?: number;
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
  tags?: string[];
}

export type ScheduleUpdateRequest = ScheduleCreateRequest;

export interface ScheduleMember {
  userId: number;
  nickname: string;
  role: 'LEADER' | 'MEMBER';
}
