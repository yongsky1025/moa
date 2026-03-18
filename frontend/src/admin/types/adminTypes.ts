export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'WITHDRAWN' | 'SUSPENDED' | 'BANNED';
export type UserGender = 'MALE' | 'FEMALE' | 'UNSPECIFIED'; // 미설정

export type CircleStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'PENDING' | 'REJECTED';
export type CircleMemberRole = 'LEADER' | 'MEMBER';

export type ReportTargetType = 'USER' | 'POST' | 'REPLY' | 'CIRCLE';
export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
export type SanctionState = 'ACTIVE' | 'LIFTED' | 'CANCELLED';

export type ReportCategory =
  | 'SPAM'
  | 'OBSCENE'
  | 'ABUSE'
  | 'FRAUD'
  | 'PRIVACY'
  | 'INAPPROPRIATE'
  | 'OTHER';

export type SanctionType =
  | 'WARNING'
  | 'BAN_1D'
  | 'BAN_3D'
  | 'BAN_30D'
  | 'PERMANENT_BAN'
  | 'CONTENT_DELETE';

export interface PageRequestDTO {
  page: number; // 1-based
  size: number;
}

/** PageResultDTO<T> */
export interface PageResultDTO<T> {
  dtoList: T[];
  pageNumList: number[];
  prev: boolean;
  next: boolean;
  prevPage: number;
  nextPage: number;
  totalPage: number;
  current: number; // (1-based)
  totalCount: number;
}

// 유저 수, 성비, 모임가입현황
export interface UserCountDTO {
  countTotalUser: number;
  maleUser: number;
  femaleUser: number;
  unspecifiedUser: number;
  maleRatio: number; // 소수점 1자리 (e.g. 52.3)
  femaleRatio: number;
  unspecifiedRatio: number;
  countJoinUser: number;
}

// 최근 한 달 가입/탈퇴 현황
export interface UserStatusDTO {
  year: number;
  month: number;
  date: number; // 기준일
  signUpCount: number;
  withdrawnCount: number;
}

export interface CircleDataDTO {
  categoryName: string;
  countPerCategory: number;
}

export interface CircleSummaryDTO {
  circleCount: number;
  circleDataDTOs: CircleDataDTO[];
}

// 월별 가입/탈퇴 수 (12개월치)
export interface MonthlyCountDTO {
  year: number;
  month: number;
  count: number;
}

export interface DashboardChartDTO {
  signUpChart: MonthlyCountDTO[];
  withdrawnChart: MonthlyCountDTO[];
}

export interface AdminMainDTO {
  userCountDTO: UserCountDTO;
  userStatusDTO: UserStatusDTO;
  circleSummaryDTO: CircleSummaryDTO;
  dashboardChartDTO: DashboardChartDTO;
}

export interface DailyCountDTO {
  date: string; // ISO 8601 (e.g. "2025-03-10") — LocalDate 직렬화
  count: number;
}

export interface PostActivitySummaryDTO {
  todayPostCount: number;
  todayReplyCount: number;
  weeklyPosts: DailyCountDTO[];
  weeklyReplies: DailyCountDTO[];
}

// ================= 유저관리 ==============
export interface AdminUserSearchDTO extends PageRequestDTO {
  name?: string;
  gender?: UserGender;
  status?: UserStatus;
  role?: UserRole;
}

export interface AdminUserResponseDTO {
  userId: number;
  name: string;
  age: number;
  birth: string; // LocalDate → "yyyy-MM-dd"
  gender?: UserGender;
  role: UserRole;
  status: UserStatus;
  createDate: string; // LocalDateTime → ISO 8601
}

export interface UserInfoDTO {
  userId: number;
  name: string;
  age: number;
  birthDate: string;
  gender: UserGender;
  role: UserRole;
  userStatus: UserStatus;
  createDate: string;
  countCreateBoard: number;
  countCreateReply: number;
  countJoinCircle: number;
}

export interface UserInfoPostDTO {
  boardName: number;
  title: string;
  content: string;
  createDate: string;
  countReply: number;
}

export interface UserInfoReplyDTO {
  title: string; // 댓글이 달린 게시글 제목
  content: string;
  createDate: string;
}

export interface UserInfoCircleDTO {
  userName: string;
  circleName: string;
  currentMember: number;
  createDate: string;
  categoryName: string;
  role: CircleMemberRole;
}

// =======모임관리=========
export interface AdminCircleSearchDTO extends PageRequestDTO {
  circleName?: string;
  categoryName?: string;
  status?: CircleStatus;
  leaderName?: string;
}

export interface AdminCircleResponseDTO {
  circleId: number;
  categoryName: string;
  circleName: string;
  leaderName: string;
  currentMember: number;
  maxMember: number;
  status: CircleStatus;
}

export interface PopularCircleDTO {
  circleId: number;
  circleName: string;
  categoryName: string;
  currentMember: number;
  score: number;
}

// ==========신고관리===============
export interface ReportFilterDTO extends PageRequestDTO {
  targetType?: ReportTargetType;
  category?: ReportCategory;
  status?: ReportStatus;
}

export interface ReportResponseDTO {
  reportId: number;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: number;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  adminNote?: string;
  createDate: string;
  modifiedDate: string;
}

export interface ReportStatusUpdateRequest {
  status: ReportStatus;
  adminNote?: string;
}

// ===== 제재 관리 =====
export interface SanctionFilterDTO extends PageRequestDTO {
  targetType?: ReportTargetType;
  sanctionType?: SanctionType;
  sanctionState?: SanctionState;
}

export interface SanctionResponseDTO {
  sanctionId: number;
  targetUserId: number;
  targetUserName: string;
  adminId: number;
  adminName: string;
  targetType: ReportTargetType;
  targetId: number;
  sanctionType: SanctionType;
  reason: string;
  startAt: string;
  endAt: string | null; // null = 영구 정지
  sanctionState: SanctionState;
  cancelledById?: number;
  cancelReason?: string;
  cancelledAt?: string;
  createDate: string;
  reportId?: number; // 직권 제재면 없을수도
}

export interface SanctionApplyRequest {
  reportId?: number;
  targetUserId: number;
  targetType: ReportTargetType;
  targetId?: number;
  sanctionType: SanctionType;
  reason: string;
}

export interface SanctionCancelRequest {
  cancelReason: string;
}
