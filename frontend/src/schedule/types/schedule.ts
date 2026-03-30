export type ScheduleStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ScheduleTagItem {
  id: number;
  name: string;
}

export interface ScheduleResponse {
  scheduleId: number;
  circleId?: number;
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
  tags?: ScheduleTagItem[];
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
  tagIds?: number[];
}

export type ScheduleUpdateRequest = ScheduleCreateRequest;

export interface ScheduleMember {
  userId: number;
  nickname: string;
  role: 'LEADER' | 'MEMBER';
}

export interface ScheduleReview {
  reviewId: number;
  scheduleId: number;
  scheduleTitle?: string;
  userId: number;
  nickname: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface ScheduleReviewCreateRequest {
  content: string;
  rating: number;
}
