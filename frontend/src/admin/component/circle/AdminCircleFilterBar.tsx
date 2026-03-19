import { useEffect, useState } from 'react';
import { useAdminCircles } from '../../context/AdminCirclesContext';
import { fetchCircleCategories } from '../../api/adminCircleApi';
import type { CircleStatus } from '../../types/adminTypes';

const STATUS_OPTIONS: { value: CircleStatus | ''; label: string }[] = [
  { value: '',         label: '전체 상태' },
  { value: 'OPEN',     label: '모집중' },
  { value: 'FULL',     label: '정원마감' },
  { value: 'PENDING',  label: '대기' },
  { value: 'REJECTED', label: '반려' },
  { value: 'CLOSED',   label: '해산' },
];

const TYPE_OPTIONS = [
  { value: '',       label: '검색 조건' },
  { value: 'name',   label: '모임명' },
  { value: 'leader', label: '리더명' },
  { value: 'id',     label: '모임 ID' },
];

const filterSelectCls = (active: boolean) =>
  `h-9 cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors ${
    active
      ? 'border-moa-primary bg-moa-light font-semibold text-moa-primary'
      : 'border-moa-border bg-white text-moa-text hover:border-moa-primary'
  }`;

export default function AdminCircleFilterBar() {
  const { params, applyFilter } = useAdminCircles();
  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [searchType, setSearchType] = useState(params.type ?? '');
  const [status, setStatus] = useState<CircleStatus | ''>(params.status ?? '');
  const [category, setCategory] = useState(params.categoryName ?? '');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCircleCategories().then(setCategories).catch(() => {});
  }, []);

  const hasFilter = !!(params.keyword || params.status || params.categoryName);

  const handleSearch = () => {
    applyFilter({
      type: keyword.trim() && searchType ? searchType : undefined,
      keyword: keyword.trim() && searchType ? keyword.trim() : undefined,
      status: status || undefined,
      categoryName: category || undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setSearchType('');
    setStatus('');
    setCategory('');
    applyFilter({ type: undefined, keyword: undefined, status: undefined, categoryName: undefined });
  };

  return (
    <div className="border-moa-border rounded-2xl border bg-white shadow-sm">
      <div className="border-moa-border flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-moa-primary h-4 w-1 rounded-full" />
          <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">검색 및 필터</span>
        </div>
        {hasFilter && (
          <button
            onClick={handleReset}
            className="text-moa-subtle hover:text-moa-primary cursor-pointer text-xs underline underline-offset-2 transition-colors"
          >
            전체 초기화
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={filterSelectCls(!!searchType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div className="border-moa-border bg-moa-light focus-within:border-moa-primary flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 transition-colors focus-within:bg-white">
            <svg className="text-moa-subtle h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어 입력"
              className="text-moa-text placeholder:text-moa-subtle flex-1 bg-transparent text-sm outline-none"
            />
            {keyword && (
              <button
                onClick={() => { setKeyword(''); applyFilter({ type: undefined, keyword: undefined }); }}
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-moa-subtle text-xs font-medium">필터</span>
          <div className="bg-moa-border h-4 w-px" />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CircleStatus | '')}
            className={filterSelectCls(!!status)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={filterSelectCls(!!category)}
          >
            <option value="">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="border-moa-primary text-moa-primary hover:bg-moa-light h-9 cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
