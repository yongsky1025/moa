export type ScheduleStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

export type ReservationStatus = 'HOLDING' | 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export interface ScheduleReservation {
  reservationId: number;
  placeId: number;
  placeName: string;
  placeAddress: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: ReservationStatus;
}

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
  isPending?: boolean;
  isCreator?: boolean;
  pendingCount?: number;
  tags?: ScheduleTagItem[];
  chatRoomId?: number;
  reservation?: ScheduleReservation | null;
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
  scheduleMemberId: number;
  userId: number;
  nickname: string;
  role: 'LEADER' | 'MEMBER';
  status: 'JOIN' | 'PENDING' | 'CANCELLED';
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
