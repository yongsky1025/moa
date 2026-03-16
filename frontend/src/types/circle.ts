export type CircleStatus = 'ACTIVE' | 'DISBANDED';
export type CircleRole = 'LEADER' | 'MEMBER';
export type CircleMemberStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'KICKED';

export interface Circle {
  circleId: number;
  name: string;
  description: string;
  status: CircleStatus;
  maxMember: number;
  currentMember: number;
  categoryName: string;
}

export interface CircleMember {
  circleMemberId: number;
  userId: number;
  nickname: string;
  role: CircleRole;
  status: CircleMemberStatus;
}

export interface PageResponse<T> {
  dtoList: T[];
  total: number;
  page: number;
  size: number;
}
