export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "WITHDRAWN" | "SUSPENDED" | "BANNED";
export type UserGender = "MALE" | "FEMALE" | "UNSPECIFIED"; // 미설정

export type CircleStatus = "OPEN" | "FULL" | "CLOSED" | "PENDING" | "REJECTED";
export type CircleMemberRole = "LEADER" | "MEMBER";

export type BoardType = "NOTICE" | "FREE" | "SUPPORT" | "CIRCLE";
export type NoticeCategory = "ANNOUNCEMENT" | "EVENT" | "UPDATE";

export type ReportTargetType = "USER" | "POST" | "REPLY" | "CIRCLE" | "PLACE_REVIEW";
export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";
export type SanctionState = "ACTIVE" | "LIFTED" | "CANCELLED";

export type ReportCategory =
  | "SPAM"
  | "OBSCENE"
  | "ABUSE"
  | "FRAUD"
  | "PRIVACY"
  | "INAPPROPRIATE"
  | "OTHER";

export type SanctionType =
  | "WARNING"
  | "BAN_1D"
  | "BAN_3D"
  | "BAN_30D"
  | "PERMANENT_BAN"
  | "CONTENT_DELETE";

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

export interface PopularPlaceDTO {
  placeId: number;
  name: string;
  city: string;
  score: number;
  averageRating: number;
  recentReservationCount: number;
  recentLikeCount: number;
}

export interface ReservationCountDTO {
  todayCount: number;
  yesterdayCount: number;
  todayChangeRate: number;
  weekCount: number;
  lastWeekCount: number;
  weekChangeRate: number;
}

export interface AdminMainDTO {
  userCountDTO: UserCountDTO;
  userStatusDTO: UserStatusDTO;
  circleSummaryDTO: CircleSummaryDTO;
  dashboardChartDTO: DashboardChartDTO;
  popularPlaceDTOs: PopularPlaceDTO[];
  reservationCountDTO: ReservationCountDTO;
  placeUtilizationRateDTO: number;
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

// export interface

// ================= 유저관리 ==============
export interface AdminUserSearchDTO extends PageRequestDTO {
  gender?: UserGender;
  status?: UserStatus;
  role?: UserRole;
  sort?: string;
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
  circleId: number;
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
  sort?: string;
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

export interface AdminCircleCategoryRequestDTO {
  categoryName: string;
}

// ======= 모임 상세 =======
export interface AdminCircleDetailDTO {
  circleId: number;
  circleName: string;
  description: string;
  categoryName: string;
  leaderName: string;
  leaderId: number;
  currentMember: number;
  maxMember: number;
  status: string;
  coverImageUrl: string | null;
  createDate: string;
  totalPosts: number;
}

export interface AdminCircleMemberDTO {
  userId: number;
  userName: string;
  gender: string;
  role: string;
  status: string;
  joinDate: string;
}

export interface AdminCirclePostDTO {
  postId: number;
  title: string;
  authorName: string;
  viewCount: number;
  replyCount: number;
  createDate: string;
}

// pending 목록용 (CircleResponseDTO 매핑)
export interface PendingCircleDTO {
  circleId: number;
  name: string;
  description: string;
  status: string;
  maxMember: number;
  currentMember: number;
  categoryId: number;
  categoryName: string;
  coverImageUrl: string | null;
}

// ===== 게시글 관리 =====
export interface AdminPostSearchDTO extends PageRequestDTO {
  boardType?: BoardType;
  deleted?: boolean;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  circleId?: number;
  sort?: string; // newest, views, replies
}

export interface AdminPostResponseDTO {
  postId: number;
  title: string;
  authorName: string;
  authorId: number;
  boardName: string;
  boardType: BoardType;
  circleName: string | null;
  circleId: number | null;
  viewCount: number;
  replyCount: number;
  noticeCategory?: NoticeCategory | null;
  deleted: boolean;
  createDate: string;
}

export interface AdminReplyDTO {
  replyId: number;
  content: string;
  authorName: string;
  authorId: number;
  parentId: number | null;
  depth: number;
  deleted: boolean;
  createDate: string;
}

export interface AdminPostDetailDTO {
  postId: number;
  title: string;
  content: string;
  authorName: string;
  authorId: number;
  boardName: string;
  boardType: BoardType;
  circleName: string | null;
  circleId: number | null;
  boardId: number;
  viewCount: number;
  noticeCategory?: NoticeCategory | null;
  deleted: boolean;
  sanctionId: number | null;
  createDate: string;
  updateDate: string;
  replies: AdminReplyDTO[];
}

export interface AdminNoticeRequestDTO {
  title: string;
  content: string;
  noticeCategory: NoticeCategory;
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
  imagePaths?: string[];
}

export interface UserRecentActivityDTO {
  type: "POST" | "REPLY";
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface ReportTargetContentDTO {
  targetType: ReportTargetType;
  targetId: number;
  deleted: boolean;
  linkUrl?: string | null;
  // POST
  postTitle?: string | null;
  postContent?: string | null;
  postAuthorName?: string | null;
  postBoardId?: number | null;
  postCreatedAt?: string | null;
  // REPLY
  replyContent?: string | null;
  replyAuthorName?: string | null;
  replyPostId?: number | null;
  replyPostTitle?: string | null;
  replyCreatedAt?: string | null;
  // CIRCLE
  circleName?: string | null;
  circleDescription?: string | null;
  circleStatus?: string | null;
  circleMaxMember?: number | null;
  circleCurrentMember?: number | null;
  circleCreatedAt?: string | null;
  // USER
  userNickname?: string | null;
  userEmail?: string | null;
  userStatus?: string | null;
  userSanctionCount?: number | null;
  userRecentActivities?: UserRecentActivityDTO[] | null;
  // PLACE_REVIEW
  placeReviewContent?: string | null;
  placeReviewRating?: number | null;
  placeReviewAuthorName?: string | null;
  placeReviewPlaceName?: string | null;
  placeReviewPlaceId?: number | null;
  placeReviewCreatedAt?: string | null;
}

export interface ReportResponseDTO {
  reportId: number;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: number;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  adminNote?: string | null;
  createdAt: string;
  targetContent?: ReportTargetContentDTO | null;
  imagePaths?: string[] | null;
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
  dayOfweek: number; // 1=Mon ... 7=Sun (Java DayOfWeek)
  hour: number; // 0-23
  activityCount: number; // 합산
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

export interface CategoryUsageDTO {
  categoryName: string;
  count: number;
  percentage: number;
}

export interface CityDistDTO {
  city: string;
  count: number;
  percentage: number;
}

export interface PlaceConversionRateDTO {
  rate: number;
  linkedSchedules: number;
  totalSchedules: number;
}

export interface AdminPlaceStatisticDTO {
  categoryUsageDTOs: CategoryUsageDTO[];
  cityDistDTOs: CityDistDTO[];
  placeConversionRateDTO: PlaceConversionRateDTO;
}

export interface DistrictDistDTO {
  city: string;
  district: string;
  count: number;
  percentage: number;
  monthOverMonthChange: number;
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
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "WITHDRAW"
  | "JOIN_CIRCLE"
  | "LEAVE_CIRCLE"
  | "UNKNOWN";

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

// ===== 장소 관리 =====
export type PlaceStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface AdminPlaceSearchDTO extends PageRequestDTO {
  sort?: string; // newest, name, capacity, price, rating, reviews
  city?: string;
  district?: string;
  status?: PlaceStatus;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

export interface AdminPlaceResponseDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  dong?: string;
  capacity: number;
  pricePerHour: number;
  avgRating: number;
  reviewCount: number;
  status: PlaceStatus;
}

export interface AdminPlaceDetailDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  dong?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  pricePerHour: number;
  description: string;
  openTimeHour: number;
  openTimeMinute: number;
  closeTimeHour: number;
  closeTimeMinute: number;
  minReservationMinutes: number;
  maxReservationMinutes: number;
  status: PlaceStatus;
  avgRating: number;
  reviewCount: number;
  tagIds: number[];
  closedDays: ClosedDayDTO[];
  imagePaths: string[] | null;
}

export interface ClosedDayDTO {
  id?: number;
  dayOfWeek?: string;
  date?: string;
  reason?: string;
  closedType: string;
}

// ── 태그 관련 ──────────────────────────────

export interface TagDTO {
  id: number;
  name: string;
}

export interface TagCategoryGroupDTO {
  categoryId: number;
  categoryName: string;
  tags: TagDTO[];
}

// ── 장소 등록 ──────────────────────────────

export interface PlaceClosedDayRequest {
  dayOfWeek?: string;
  date?: string;
  reason?: string;
  closedType: string;
}

export interface PlaceCreateRequest {
  name: string;
  address: string;
  city: string;
  district: string;
  dong?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  pricePerHour: number;
  description: string;
  openTimeHour: number;
  openTimeMinute: number;
  closeTimeHour: number;
  closeTimeMinute: number;
  minReservationMinutes: number;
  maxReservationMinutes: number;
  tagIds: number[];
  placeClosedDays: PlaceClosedDayRequest[];
  imagePaths?: string[];
}

// ── 장소 목록 ──────────────────────────────

export interface PlaceListItem {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  dong?: string;
  capacity: number;
  pricePerHour: number;
  avgRating: number;
  reviewCount: number;
}
