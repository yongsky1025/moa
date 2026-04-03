// ── 태그 ─────────────────────────────────────
export interface TagDTO {
  id: number;
  name: string;
}

export interface TagCategoryGroupDTO {
  categoryId: number;
  categoryName: string;
  tags: TagDTO[];
}

// ── 장소 목록 카드 ────────────────────────────
export interface PlaceCardDTO {
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
  avgRating: number;
  reviewCount: number;
  representativeImagePath?: string;
  minReservationMinutes?: number;
  liked?: boolean;
}

// ── 장소 상세 ────────────────────────────────
export interface PlaceDetailDTO {
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
  avgRating: number;
  reviewCount: number;
  representativeImagePath?: string;
  description: string;
  minReservationMinutes: number;
  maxReservationMinutes: number;
  openTime: string; // "HH:mm:ss"
  closeTime: string; // "HH:mm:ss"
  tags: TagDTO[];
  closedDays: PlaceClosedDayDTO[];
  images: string[];
  likeCount: number;
  liked?: boolean;
}

// ── 휴무일 ────────────────────────────────────
export interface PlaceClosedDayDTO {
  dayOfWeek?: string; // MONDAY ~ SUNDAY
  date?: string; // yyyy-MM-dd
  reason: string;
  closedType: string; // WEEKLY | HOLIDAY
}

// ── 리뷰 (장소 상세 페이지) ──────────────────
export interface PlaceReviewDTO {
  id: number;
  rating: number;
  comment: string;
  reviewerNickname: string;
  createdAt?: string;
  images?: string[];
}

// ── 마이페이지 - 내가 쓴 후기 ─────────────────
export interface MyPlaceReviewDTO {
  reviewId: number;
  placeId: number;
  placeName: string;
  reservationStartTime: string;
  rating: number;
  comment: string;
  createdAt: string;
  images: string[];
}

// ── 마이페이지 - 작성 가능한 후기 ─────────────
export interface PendingReviewDTO {
  reservationId: number;
  placeId: number;
  placeName: string;
  startTime: string;
  endTime: string;
  reviewDeadline: string;
}

// ── 검색 파라미터 ────────────────────────────
export interface PlaceSearchParams {
  keyword?: string;
  sort?:
    | "newest"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "reviews"
    | "capacity";
  city?: string;
  districts?: string[]; // 구/시 복수 선택
  dong?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  tagIds?: number[];
  availableDate?: string; // yyyy-MM-dd
  lastId?: number;
  size?: number;
}

// ── 목록 응답 ────────────────────────────────
export interface PlaceListResponse {
  places: PlaceCardDTO[];
  hasNext: boolean;
  lastId: number | null;
}

// ── 예약 점유 슬롯 ─────────────────────────
export interface OccupiedSlotDTO {
  startTime: string // "HH:mm" or "HH:mm:ss"
  endTime: string
}

// ── hold 응답 ─────────────────────────────
export interface HoldResponse {
  reservationId: number
  orderId: string
  amount: number
  orderName: string
}

// ── 내 예약 목록 ──────────────────────────
export interface MyReservationDTO {
  reservationId: number
  placeId: number
  placeName: string
  startTime: string // ISO datetime
  endTime: string
  totalPrice: number
  status: string // HOLDING | RESERVED | CANCELLED | COMPLETED | EXPIRED
  thumbnailUrl?: string
}

// ── 찜한 장소 ────────────────────────────
export interface MyLikedPlaceDTO {
  placeId: number
  name: string
  city: string
  district: string
  capacity: number
  avgRating: number
  reviewCount: number
  pricePerHour: number
  thumbnailUrl?: string
  tags: string[]
}

// ── 이용한 장소 ──────────────────────────
export interface MyUsedPlaceDTO {
  reservationId: number
  placeId: number
  placeName: string
  startTime: string
  endTime: string
  totalPrice: number
  thumbnailUrl?: string
  sourceType: 'DIRECT' | 'SCHEDULE'
  hasReview: boolean
}

// ── 일정 연결용 내 일정 목록 ──────────────
export interface MyUpcomingScheduleDTO {
  scheduleId: number
  title: string
  startAt: string // ISO datetime
  endAt: string
  circleId: number
  circleName: string
}
