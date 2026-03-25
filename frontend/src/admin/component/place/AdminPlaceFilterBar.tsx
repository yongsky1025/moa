import { useState } from "react";
import { useAdminPlaces } from "../../context/AdminPlacesContext";
import AdminFilterBar, { filterSelectCls } from "../AdminFilterBar";
import type { AppliedFilter } from "../AdminFilterBar";
import type { PlaceStatus } from "../../types/adminTypes";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "최신순" },
  { value: "name", label: "이름순" },
  { value: "capacity", label: "수용인원순" },
  { value: "price", label: "가격순" },
  { value: "rating", label: "평점순" },
  { value: "reviews", label: "후기순" },
];

const SEARCH_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "name", label: "장소명" },
  { value: "address", label: "주소" },
  { value: "description", label: "설명" },
];

const STATUS_OPTIONS: { value: PlaceStatus | ""; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "ACTIVE", label: "운영중" },
  { value: "INACTIVE", label: "비활성" },
  { value: "MAINTENANCE", label: "점검중" },
];

const CITY_OPTIONS = [
  "", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const findLabel = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

const inputCls =
  "border-moa-border bg-moa-light focus:border-moa-primary h-9 w-28 rounded-lg border px-2 text-center text-sm outline-none transition-colors focus:bg-white";

export default function AdminPlaceFilterBar() {
  const { params, applyFilter } = useAdminPlaces();

  const [keyword, setKeyword] = useState(params.keyword ?? "");
  const [searchType, setSearchType] = useState(params.type ?? "");
  const [sort, setSort] = useState(params.sort ?? "newest");
  const [status, setStatus] = useState<PlaceStatus | "">(params.status ?? "");
  const [city, setCity] = useState(params.city ?? "");
  const [minPrice, setMinPrice] = useState(params.minPrice != null ? String(params.minPrice) : "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice != null ? String(params.maxPrice) : "");
  const [minCapacity, setMinCapacity] = useState(params.minCapacity != null ? String(params.minCapacity) : "");
  const [maxCapacity, setMaxCapacity] = useState(params.maxCapacity != null ? String(params.maxCapacity) : "");

  const hasFilter = !!(
    params.keyword ||
    (params.sort && params.sort !== "newest") ||
    params.status ||
    params.city ||
    params.minPrice != null ||
    params.maxPrice != null ||
    params.minCapacity != null ||
    params.maxCapacity != null
  );

  const handleSearch = () => {
    applyFilter({
      type: searchType || undefined,
      keyword: keyword.trim() || undefined,
      sort: sort || undefined,
      status: status || undefined,
      city: city || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minCapacity: minCapacity ? Number(minCapacity) : undefined,
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setSearchType("");
    setSort("newest");
    setStatus("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinCapacity("");
    setMaxCapacity("");
    applyFilter({
      type: undefined,
      keyword: undefined,
      sort: undefined,
      status: undefined,
      city: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minCapacity: undefined,
      maxCapacity: undefined,
    });
  };

  // ─── 적용됨 태그 구성 ──────────────────────────────────────────────────────
  const appliedFilters: AppliedFilter[] = [];
  if (params.keyword) {
    appliedFilters.push({
      key: "keyword",
      label: findLabel(SEARCH_TYPE_OPTIONS, params.type ?? ""),
      value: params.keyword,
      onRemove: () => {
        setKeyword("");
        applyFilter({ type: undefined, keyword: undefined });
      },
    });
  }
  if (params.sort && params.sort !== "newest") {
    appliedFilters.push({
      key: "sort",
      label: "정렬",
      value: findLabel(SORT_OPTIONS, params.sort),
      onRemove: () => {
        setSort("newest");
        applyFilter({ sort: undefined });
      },
    });
  }
  if (params.status) {
    appliedFilters.push({
      key: "status",
      label: "상태",
      value: findLabel(STATUS_OPTIONS, params.status),
      onRemove: () => {
        setStatus("");
        applyFilter({ status: undefined });
      },
    });
  }
  if (params.city) {
    appliedFilters.push({
      key: "city",
      label: "지역",
      value: params.city,
      onRemove: () => {
        setCity("");
        applyFilter({ city: undefined });
      },
    });
  }
  if (params.minPrice != null || params.maxPrice != null) {
    const min = params.minPrice != null ? `${params.minPrice.toLocaleString()}원` : "";
    const max = params.maxPrice != null ? `${params.maxPrice.toLocaleString()}원` : "";
    appliedFilters.push({
      key: "price",
      label: "가격",
      value: min && max ? `${min} ~ ${max}` : min ? `${min} 이상` : `${max} 이하`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
        applyFilter({ minPrice: undefined, maxPrice: undefined });
      },
    });
  }
  if (params.minCapacity != null || params.maxCapacity != null) {
    const min = params.minCapacity != null ? `${params.minCapacity}명` : "";
    const max = params.maxCapacity != null ? `${params.maxCapacity}명` : "";
    appliedFilters.push({
      key: "capacity",
      label: "인원",
      value: min && max ? `${min} ~ ${max}` : min ? `${min} 이상` : `${max} 이하`,
      onRemove: () => {
        setMinCapacity("");
        setMaxCapacity("");
        applyFilter({ minCapacity: undefined, maxCapacity: undefined });
      },
    });
  }

  return (
    <AdminFilterBar
      hasFilter={hasFilter}
      onReset={handleReset}
      appliedFilters={appliedFilters}
    >
      {/* 1행: 검색 */}
      <div className="flex items-center gap-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className={filterSelectCls(!!searchType)}
        >
          {SEARCH_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="border-moa-border bg-moa-light focus-within:border-moa-primary flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 transition-colors focus-within:bg-white">
          <svg
            className="text-moa-subtle h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="검색어 입력"
            className="text-moa-text placeholder:text-moa-subtle flex-1 bg-transparent text-sm outline-none"
          />
          {keyword && (
            <button
              onClick={() => {
                setKeyword("");
                applyFilter({ type: undefined, keyword: undefined });
              }}
              className="text-moa-subtle hover:text-moa-primary cursor-pointer text-xs transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-moa-primary hover:bg-moa-hover h-10 cursor-pointer rounded-lg px-6 text-sm font-bold text-white shadow-sm transition-colors"
        >
          검색
        </button>
      </div>

      {/* 2행: 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-moa-subtle text-xs font-medium">필터</span>
        <div className="bg-moa-border h-4 w-px" />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PlaceStatus | "")}
          className={filterSelectCls(!!status)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={filterSelectCls(!!city)}
        >
          <option value="">전체 지역</option>
          {CITY_OPTIONS.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="bg-moa-border h-4 w-px" />
        <span className="text-moa-subtle text-xs font-medium">가격</span>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="최소"
          className={inputCls}
        />
        <span className="text-moa-subtle text-xs">~</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="최대"
          className={inputCls}
        />

        <div className="bg-moa-border h-4 w-px" />
        <span className="text-moa-subtle text-xs font-medium">인원</span>
        <input
          type="number"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          placeholder="최소"
          className={inputCls}
        />
        <span className="text-moa-subtle text-xs">~</span>
        <input
          type="number"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          placeholder="최대"
          className={inputCls}
        />

        <button
          onClick={handleSearch}
          className="border-moa-primary text-moa-primary hover:bg-moa-light h-9 cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors"
        >
          적용
        </button>
      </div>

      {/* 3행: 정렬 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-moa-subtle text-xs font-medium">정렬</span>
        <div className="bg-moa-border h-4 w-px" />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            applyFilter({ sort: e.target.value || undefined });
          }}
          className={filterSelectCls(sort !== "newest")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </AdminFilterBar>
  );
}
