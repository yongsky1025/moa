import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

const PRICE_MIN = 0;
const PRICE_MAX = 200000;
const STEP = 5000;

function formatPrice(v: number) {
  if (v === 0) return "0원";
  if (v >= 10000) return `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}만원`;
  return `${v.toLocaleString()}원`;
}

interface Props {
  minPrice?: number;
  maxPrice?: number;
  onChange: (min?: number, max?: number) => void;
}

export default function PlacePriceRangeFilter({ minPrice, maxPrice, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(minPrice ?? PRICE_MIN);
  const [localMax, setLocalMax] = useState(maxPrice ?? PRICE_MAX);
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // props 동기화
  useEffect(() => {
    setLocalMin(minPrice ?? PRICE_MIN);
    setLocalMax(maxPrice ?? PRICE_MAX);
  }, [minPrice, maxPrice]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), localMax - STEP);
    setLocalMin(v);
    onChange(v === PRICE_MIN ? undefined : v, localMax === PRICE_MAX ? undefined : localMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), localMin + STEP);
    setLocalMax(v);
    onChange(localMin === PRICE_MIN ? undefined : localMin, v === PRICE_MAX ? undefined : v);
  };

  const handleReset = () => {
    setLocalMin(PRICE_MIN);
    setLocalMax(PRICE_MAX);
    onChange(undefined, undefined);
  };

  const isActive = minPrice !== undefined || maxPrice !== undefined;

  // 트랙 하이라이트 비율
  const leftPct  = ((localMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rightPct = 100 - ((localMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  // 버튼 레이블
  let label = "가격";
  if (isActive) {
    const lo = minPrice !== undefined ? formatPrice(minPrice) : "0원";
    const hi = maxPrice !== undefined ? formatPrice(maxPrice) : "무제한";
    label = `${lo} ~ ${hi}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        {label}
        {isActive ? (
          <span
            onMouseDown={(e) => { e.stopPropagation(); handleReset(); }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-[#d4ebe2]"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-72 rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">시간당 가격</span>
            {isActive && (
              <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600">
                초기화
              </button>
            )}
          </div>

          {/* 슬라이더 트랙 */}
          <div ref={trackRef} className="relative mb-5 h-1.5">
            {/* 전체 트랙 */}
            <div className="absolute inset-0 rounded-full bg-gray-200" />
            {/* 선택 구간 강조 */}
            <div
              className="absolute h-full rounded-full bg-[#5F8F7B]"
              style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
            />
            {/* Min 핸들 */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={STEP}
              value={localMin}
              onChange={handleMinChange}
              className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5F8F7B] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
            />
            {/* Max 핸들 */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={STEP}
              value={localMax}
              onChange={handleMaxChange}
              className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5F8F7B] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          {/* 가격 표시 */}
          <div className="flex items-center justify-between">
            <div className="rounded-lg border border-gray-200 px-3 py-1.5 text-center">
              <p className="text-xs text-gray-400">최소</p>
              <p className="text-sm font-semibold text-gray-800">
                {localMin === PRICE_MIN ? "0원" : formatPrice(localMin)}
              </p>
            </div>
            <div className="h-px w-4 bg-gray-300" />
            <div className="rounded-lg border border-gray-200 px-3 py-1.5 text-center">
              <p className="text-xs text-gray-400">최대</p>
              <p className="text-sm font-semibold text-gray-800">
                {localMax === PRICE_MAX ? "무제한" : formatPrice(localMax)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
