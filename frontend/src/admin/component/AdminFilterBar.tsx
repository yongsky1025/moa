import type { ReactNode } from 'react';

// ─── 공용 스타일 유틸 ────────────────────────────────────────────────────────
export const filterSelectCls = (active: boolean) =>
  `h-9 cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors ${
    active
      ? 'border-moa-primary bg-moa-light font-semibold text-moa-primary'
      : 'border-moa-border bg-white text-moa-text hover:border-moa-primary'
  }`;

// ─── 적용됨 태그 타입 ────────────────────────────────────────────────────────
export interface AppliedFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface AdminFilterBarProps {
  children: ReactNode;
  hasFilter: boolean;
  onReset: () => void;
  appliedFilters?: AppliedFilter[];
}

// ─── 레이아웃 컴포넌트 ──────────────────────────────────────────────────────
export default function AdminFilterBar({
  children,
  hasFilter,
  onReset,
  appliedFilters = [],
}: AdminFilterBarProps) {
  const activeCount = appliedFilters.length;

  return (
    <div className="rounded-2xl border border-moa-border bg-white shadow-sm">

      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between border-b border-moa-border px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-moa-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-moa-secondary">
            검색 및 필터
          </span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-moa-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {hasFilter && (
          <button
            onClick={onReset}
            className="cursor-pointer text-xs text-moa-subtle underline underline-offset-2 transition-colors hover:text-moa-primary"
          >
            전체 초기화
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* ── 페이지별 콘텐츠 (검색행, 필터행, 정렬행 등) ── */}
        {children}

        {/* ── 적용된 필터 태그 ── */}
        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-moa-subtle">적용됨:</span>
            {appliedFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-moa-primary px-3 py-1 text-xs font-semibold text-white"
              >
                {f.label} : {f.value}
                <button
                  onClick={f.onRemove}
                  className="cursor-pointer opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
