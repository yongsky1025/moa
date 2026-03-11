export type CircleStatus = 'PENDING' | 'OPEN' | 'FULL' | 'REJECTED';
export type CircleMemberStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'WITHDRAWN';
export type CircleRole = 'LEADER' | 'MEMBER';

export interface CircleResponse {
  circleId: number;
  name: string;
  description: string;
  status: CircleStatus;
  maxMember: number;
  currentMember: number;
  categoryId: number;
  categoryName: string;
}

export interface CircleCreateRequest {
  name: string;
  description: string;
  maxMember: number;
  categoryId: number;
}

export interface CircleUpdateRequest {
  name: string;
  description: string;
  maxMember?: number;
}

export interface CircleMember {
  circleMemberId: number;
  userId: number;
  nickname: string;
  role: CircleRole;
  status: CircleMemberStatus;
}

// 백엔드 PageResultDTO 구조
export interface PageResult<T> {
  dtoList: T[];
  pageNumList: number[];
  prev: boolean;
  next: boolean;
  prevPage: number;
  nextPage: number;
  totalPage: number;
  current: number;
  totalCount: number;
}
