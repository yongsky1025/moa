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
  type?: string;
  keyword?: string;
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
  address?: string;
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
  boardName: string;
  title: string;
  content: string;
  viewCount: number;
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

export interface ReportRequestDTO {
  targetType: ReportTargetType;
  targetId: number;
  category: ReportCategory;
  description: string;
}

export interface ReportResponseDTO {
  reportId: number;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: number;
  category: ReportCategory;
  status: ReportStatus;
  adminNote?: string | null;
  createdAt: string;
}

export interface ReportStatusUpdateRequest {
  status: ReportStatus;
  adminNote?: string;
}

// ===== 통계 리포트 =====
export interface AgeGroupStatsDTO {
  ageGroup: string;
  userCount: number;
  countMale: number;
  countFemale: number;
  countOther: number;
}

export interface CircleSurvivalStatsDTO {
  totalCircle: number;
  activeCircle: number;
  survivalRate: number;
}

export interface ActivityHeatmapStatsDTO {
  dayOfweek: number;        // 1=Mon ... 7=Sun (Java DayOfWeek)
  hour: number;             // 0-23
  activityCount: number;    // 합산
  userRegisterCount: number;
  circleCreateCount: number;
  postCount: number;
  replyCount: number;
  scheduleCount: number;
}

export interface AgeCategoryRetentionStatsDTO {
  ageGroup: string;
  categoryName: string;
  totalMembers: number;
  retainedMembers: number;
  rate: number; // 0.0 ~ 100.0
}

// ===== 제재 관리 =====
export interface SanctionFilterDTO extends PageRequestDTO {
  targetType?: ReportTargetType;
  sanctionType?: SanctionType;
  sanctionState?: SanctionState;
}

export interface SanctionResponseDTO {
  reportId?: number | null;
  sanctionId: number;
  targetUserName: string;
  adminName: string;
  targetType: ReportTargetType;
  targetId: number;
  sanctionType: SanctionType;
  sanctionState: SanctionState;
  reason: string;
  startAt: string;
  endAt: string | null; // null = 영구 정지
  cancelledByName?: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
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
  adminId: number;
  cancelReason: string;
}

// ===== 유저 활동 로그 =====
export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'WITHDRAW'
  | 'JOIN_CIRCLE'
  | 'LEAVE_CIRCLE'
  | 'UNKNOWN';

export interface AdminActionLog {
  id: number;
  actorId: number | null;
  targetType: string | null;
  targetId: number | null;
  actionType: ActionType;
  methodName: string | null;
  requestUrl: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string; // ISO datetime
}

export interface LogSearchDTO extends PageRequestDTO {}
