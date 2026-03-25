import { useState } from 'react';
import { useAdminReports } from '../../context/AdminReportsContext';
import type { ReportCategory, ReportStatus, ReportTargetType } from '../../types/adminTypes';
import AdminFilterBar, { filterSelectCls } from '../AdminFilterBar';
import type { AppliedFilter } from '../AdminFilterBar';

const STATUS_OPTIONS: { value: ReportStatus | ''; label: string }[] = [
  { value: '', label: '전체 상태' },
  { value: 'PENDING', label: '대기' },
  { value: 'REVIEWING', label: '검토중' },
  { value: 'RESOLVED', label: '승인' },
  { value: 'REJECTED', label: '반려' },
];

const TARGET_OPTIONS: { value: ReportTargetType | ''; label: string }[] = [
  { value: '', label: '전체 대상' },
  { value: 'USER', label: '유저' },
  { value: 'POST', label: '게시글' },
  { value: 'REPLY', label: '댓글' },
  { value: 'CIRCLE', label: '모임' },
];

const CATEGORY_OPTIONS: { value: ReportCategory | ''; label: string }[] = [
  { value: '', label: '전체 유형' },
  { value: 'SPAM', label: '스팸' },
  { value: 'OBSCENE', label: '음란' },
  { value: 'ABUSE', label: '욕설/비하' },
  { value: 'FRAUD', label: '사기' },
  { value: 'PRIVACY', label: '개인정보' },
  { value: 'INAPPROPRIATE', label: '부적절' },
  { value: 'OTHER', label: '기타' },
];

const findLabel = (options: { value: string; label: string }[], value: string) =>
  options.find(o => o.value === value)?.label ?? value;

export default function AdminReportFilterBar() {
  const { params, applyFilter } = useAdminReports();
  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [status, setStatus] = useState<ReportStatus | ''>(params.status ?? '');
  const [targetType, setTargetType] = useState<ReportTargetType | ''>(params.targetType ?? '');
  const [category, setCategory] = useState<ReportCategory | ''>(params.category ?? '');

  const hasFilter = !!(params.keyword || params.status || params.targetType || params.category);

  const handleSearch = () => {
    // 백엔드: 이름(keyword) 기반 검색 (querydsl)
    applyFilter({
      type: keyword.trim() ? 'name' : undefined,
      keyword: keyword.trim() || undefined,
      status: status || undefined,
      targetType: targetType || undefined,
      category: category || undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setStatus('');
    setTargetType('');
    setCategory('');
    applyFilter({ type: undefined, keyword: undefined, status: undefined, targetType: undefined, category: undefined });
  };

  // ─── 적용됨 태그 구성 ──────────────────────────────────────────────────────
  const appliedFilters: AppliedFilter[] = [];
  if (params.keyword) {
    appliedFilters.push({
      key: 'keyword',
      label: '신고자',
      value: params.keyword,
      onRemove: () => { setKeyword(''); applyFilter({ type: undefined, keyword: undefined }); },
    });
  }
  if (params.status) {
    appliedFilters.push({
      key: 'status',
      label: '상태',
      value: findLabel(STATUS_OPTIONS, params.status),
      onRemove: () => { setStatus(''); applyFilter({ status: undefined }); },
    });
  }
  if (params.targetType) {
    appliedFilters.push({
      key: 'targetType',
      label: '대상',
      value: findLabel(TARGET_OPTIONS, params.targetType),
      onRemove: () => { setTargetType(''); applyFilter({ targetType: undefined }); },
    });
  }
  if (params.category) {
    appliedFilters.push({
      key: 'category',
      label: '유형',
      value: findLabel(CATEGORY_OPTIONS, params.category),
      onRemove: () => { setCategory(''); applyFilter({ category: undefined }); },
    });
  }

  return (
    <AdminFilterBar
      hasFilter={hasFilter}
      onReset={handleReset}
      appliedFilters={appliedFilters}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-moa-border bg-moa-light px-3 transition-colors focus-within:border-moa-primary focus-within:bg-white">
            <svg className="h-4 w-4 shrink-0 text-moa-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="신고자 이름으로 검색"
              className="flex-1 bg-transparent text-sm text-moa-text outline-none placeholder:text-moa-subtle"
            />
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('');
                  applyFilter({ type: undefined, keyword: undefined });
                }}
                className="cursor-pointer text-xs text-moa-subtle transition-colors hover:text-moa-primary"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-10 cursor-pointer rounded-lg bg-moa-primary px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-moa-hover"
          >
            검색
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-moa-subtle">필터</span>
        <div className="h-4 w-px bg-moa-border" />

        <select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus | '')} className={filterSelectCls(!!status)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select value={targetType} onChange={(e) => setTargetType(e.target.value as ReportTargetType | '')} className={filterSelectCls(!!targetType)}>
          {TARGET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value as ReportCategory | '')} className={filterSelectCls(!!category)}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="h-9 cursor-pointer rounded-lg border border-moa-primary px-4 text-sm font-medium text-moa-primary transition-colors hover:bg-moa-light"
        >
          적용
        </button>
      </div>
    </AdminFilterBar>
  );
}
