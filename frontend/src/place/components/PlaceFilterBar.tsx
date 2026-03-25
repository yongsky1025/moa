import { ChevronDown, X, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/style.css";
import "../styles/placeDayPicker.css";
import PlaceTagFilterDropdown, { type TagCategoryGroup } from "./PlaceTagFilterDropdown";
import type { PlaceSearchParams } from "../types/placeTypes";

// 한국 공휴일 (2025~2026 주요 날짜)
const HOLIDAYS = [
  new Date(2025, 0, 1), new Date(2025, 2, 1), new Date(2025, 4, 5),
  new Date(2025, 5, 6), new Date(2025, 7, 15), new Date(2025, 9, 3),
  new Date(2025, 9, 9), new Date(2025, 11, 25),
  new Date(2026, 0, 1), new Date(2026, 2, 1), new Date(2026, 4, 5),
  new Date(2026, 5, 6), new Date(2026, 7, 15), new Date(2026, 9, 3),
  new Date(2026, 9, 9), new Date(2026, 11, 25),
];

const CITIES = ["서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"];

const PRICE_OPTIONS = [
  { label: "가격 무관", min: undefined, max: undefined },
  { label: "~2만원", min: undefined, max: 20000 },
  { label: "2~5만원", min: 20000, max: 50000 },
  { label: "5~10만원", min: 50000, max: 100000 },
  { label: "10만원~", min: 100000, max: undefined },
];

const CAPACITY_OPTIONS = [
  { label: "인원 무관", min: undefined, max: undefined },
  { label: "~10명", min: undefined, max: 10 },
  { label: "10~30명", min: 10, max: 30 },
  { label: "30~50명", min: 30, max: 50 },
  { label: "50명~", min: 50, max: undefined },
];

const SORT_OPTIONS = [
  { label: "최신순", value: "newest" },
  { label: "가격 낮은순", value: "price_asc" },
  { label: "가격 높은순", value: "price_desc" },
  { label: "평점순", value: "rating" },
  { label: "리뷰많은순", value: "reviews" },
  { label: "인원많은순", value: "capacity" },
];

// ── 공통 드롭다운 버튼 ──────────────────────────────────────────
function FilterDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-45 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const optionCls = (active: boolean) =>
  `w-full px-4 py-2.5 text-left text-sm transition-colors ${
    active
      ? "bg-[#EAF4F0] font-semibold text-[#4E7C69]"
      : "text-gray-700 hover:bg-gray-50"
  }`;

// ── Props ──────────────────────────────────────────────────────
interface Props {
  params: PlaceSearchParams;
  tagGroups: TagCategoryGroup[];
  onParamsChange: (p: Partial<PlaceSearchParams>) => void;
  onReset: () => void;
}

export default function PlaceFilterBar({ params, tagGroups, onParamsChange, onReset }: Props) {
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedDate = params.availableDate ? new Date(params.availableDate) : undefined;

  const priceActive =
    params.minPrice !== undefined || params.maxPrice !== undefined;
  const capacityActive =
    params.minCapacity !== undefined || params.maxCapacity !== undefined;
  const hasActiveFilter =
    params.city ||
    params.district ||
    priceActive ||
    capacityActive ||
    params.availableDate ||
    (params.tagIds && params.tagIds.length > 0) ||
    (params.sort && params.sort !== "newest");

  const cityLabel = params.city ? params.city.replace(/(특별시|광역시|도|특별자치시|특별자치도)$/, "") : "지역";
  const priceLabel = priceActive
    ? PRICE_OPTIONS.find(
        (o) => o.min === params.minPrice && o.max === params.maxPrice,
      )?.label ?? "가격"
    : "가격";
  const capacityLabel = capacityActive
    ? CAPACITY_OPTIONS.find(
        (o) => o.min === params.minCapacity && o.max === params.maxCapacity,
      )?.label ?? "인원"
    : "인원";
  const dateLabel = params.availableDate
    ? params.availableDate.replace(/-/g, ".")
    : "예약가능날짜";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === (params.sort ?? "newest"))?.label ?? "정렬";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      {/* 지역 */}
      <FilterDropdown label={cityLabel} active={!!params.city}>
        <button className={optionCls(!params.city)} onClick={() => onParamsChange({ city: undefined, district: undefined })}>
          전체 지역
        </button>
        {CITIES.map((c) => (
          <button key={c} className={optionCls(params.city === c)} onClick={() => onParamsChange({ city: c, district: undefined })}>
            {c}
          </button>
        ))}
      </FilterDropdown>

      {/* 가격 */}
      <FilterDropdown label={priceLabel} active={priceActive}>
        {PRICE_OPTIONS.map((o) => (
          <button
            key={o.label}
            className={optionCls(params.minPrice === o.min && params.maxPrice === o.max)}
            onClick={() => onParamsChange({ minPrice: o.min, maxPrice: o.max })}
          >
            {o.label}
          </button>
        ))}
      </FilterDropdown>

      {/* 인원 */}
      <FilterDropdown label={capacityLabel} active={capacityActive}>
        {CAPACITY_OPTIONS.map((o) => (
          <button
            key={o.label}
            className={optionCls(params.minCapacity === o.min && params.maxCapacity === o.max)}
            onClick={() => onParamsChange({ minCapacity: o.min, maxCapacity: o.max })}
          >
            {o.label}
          </button>
        ))}
      </FilterDropdown>

      {/* 예약가능날짜 — react-day-picker */}
      <div ref={calRef} className="relative">
        <button
          onClick={() => setCalOpen((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            params.availableDate
              ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {dateLabel}
          {params.availableDate ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onParamsChange({ availableDate: undefined });
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-[#d4ebe2]"
            >
              <X className="h-3 w-3" />
            </span>
          ) : (
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${calOpen ? "rotate-180" : ""}`} />
          )}
        </button>

        {calOpen && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-30 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(day) => {
                if (!day) return;
                const yyyy = day.getFullYear();
                const mm = String(day.getMonth() + 1).padStart(2, "0");
                const dd = String(day.getDate()).padStart(2, "0");
                onParamsChange({ availableDate: `${yyyy}-${mm}-${dd}` });
                setCalOpen(false);
              }}
              disabled={[{ before: new Date() }]}
              locale={ko}
              modifiers={{ holiday: HOLIDAYS, saturday: { dayOfWeek: [6] }, sunday: { dayOfWeek: [0] } }}
              modifiersClassNames={{
                holiday: "rdp-day--holiday",
                saturday: "rdp-day--saturday",
                sunday: "rdp-day--sunday",
              }}
              classNames={{
                root: "moa-rdp",
                today: "rdp-today",
                selected: "rdp-selected",
              }}
            />
          </div>
        )}
      </div>

      {/* 태그 */}
      <PlaceTagFilterDropdown
        tagGroups={tagGroups}
        selectedTagIds={params.tagIds ?? []}
        onChange={(ids) => onParamsChange({ tagIds: ids })}
      />

      {/* 정렬 */}
      <FilterDropdown label={sortLabel} active={!!params.sort && params.sort !== "newest"}>
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            className={optionCls((params.sort ?? "newest") === o.value)}
            onClick={() => onParamsChange({ sort: o.value as PlaceSearchParams["sort"] })}
          >
            {o.label}
          </button>
        ))}
      </FilterDropdown>

      {/* 필터 초기화 */}
      {hasActiveFilter && (
        <button
          onClick={onReset}
          className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          초기화
        </button>
      )}
    </div>
  );
}
