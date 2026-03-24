export type CircleStatus = 'PENDING' | 'OPEN' | 'FULL' | 'REJECTED' | 'CLOSED';
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
  coverImageUrl?: string;
  myRole?: CircleRole;
}

export interface CircleCreateRequest {
  name: string;
  description: string;
  maxMember: number;
  categoryId: number;
  socialLoad: number;
  interactionMode: number;
  structureLevel: number;
  activityIntensity: number;
  commitmentLevel: number;
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
  statusMessage?: string;
}

export interface RecommendationItem {
  circleId: number;
  name: string;
  description: string;
  categoryName: string;
  similarity: number;
}

export interface RecommendationBundle {
  overall: RecommendationItem[];  // 5축 전체 매칭
  social: RecommendationItem[];   // socialLoad + interactionMode
  activity: RecommendationItem[]; // activityIntensity + commitmentLevel + structureLevel
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
