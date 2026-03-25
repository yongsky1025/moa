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
  district?: string;
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
