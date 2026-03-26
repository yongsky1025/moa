import { useEffect, useState } from 'react';
import { useAdminCircles } from '../../context/AdminCirclesContext';
import { fetchCircleCategories } from '../../api/adminCircleApi';
import type { CircleStatus } from '../../types/adminTypes';
import AdminFilterBar, { filterSelectCls } from '../AdminFilterBar';
import type { AppliedFilter } from '../AdminFilterBar';

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

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest',      label: '최신순 (기본)' },
  { value: 'oldest',      label: '오래된순'       },
  { value: 'name',        label: '이름순'         },
  { value: 'member_desc', label: '인원 많은순'    },
  { value: 'member_asc',  label: '인원 적은순'    },
];

const findLabel = (options: { value: string; label: string }[], value: string) =>
  options.find(o => o.value === value)?.label ?? value;

export default function AdminCircleFilterBar() {
  const { params, applyFilter } = useAdminCircles();
  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [searchType, setSearchType] = useState(params.type ?? '');
  const [status, setStatus] = useState<CircleStatus | ''>(params.status ?? '');
  const [category, setCategory] = useState(params.categoryName ?? '');
  const [sort, setSort] = useState(params.sort ?? 'newest');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCircleCategories().then(setCategories).catch(() => {});
  }, []);

  const hasFilter = !!(params.keyword || params.status || params.categoryName || (params.sort && params.sort !== 'newest'));

  const handleSearch = () => {
    applyFilter({
      type: keyword.trim() && searchType ? searchType : undefined,
      keyword: keyword.trim() && searchType ? keyword.trim() : undefined,
      status: status || undefined,
      categoryName: category || undefined,
      sort: sort !== 'newest' ? sort : undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setSearchType('');
    setStatus('');
    setCategory('');
    setSort('newest');
    applyFilter({ type: undefined, keyword: undefined, status: undefined, categoryName: undefined, sort: undefined });
  };

  // ─── 적용됨 태그 구성 ──────────────────────────────────────────────────────
  const appliedFilters: AppliedFilter[] = [];
  if (params.keyword) {
    appliedFilters.push({
      key: 'keyword',
      label: findLabel(TYPE_OPTIONS, params.type ?? ''),
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
  if (params.categoryName) {
    appliedFilters.push({
      key: 'categoryName',
      label: '카테고리',
      value: params.categoryName,
      onRemove: () => { setCategory(''); applyFilter({ categoryName: undefined }); },
    });
  }
  if (params.sort && params.sort !== 'newest') {
    appliedFilters.push({
      key: 'sort',
      label: '정렬',
      value: SORT_OPTIONS.find(o => o.value === params.sort)?.label ?? params.sort,
      onRemove: () => { setSort('newest'); applyFilter({ sort: undefined }); },
    });
  }

  return (
    <AdminFilterBar
      hasFilter={hasFilter}
      onReset={handleReset}
      appliedFilters={appliedFilters}
    >
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

      {/* 정렬 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-moa-subtle text-xs font-medium">정렬</span>
        <div className="bg-moa-border h-4 w-px" />
        <select
          value={sort}
          onChange={e => {
            setSort(e.target.value);
            applyFilter({ sort: e.target.value !== 'newest' ? e.target.value : undefined });
          }}
          className={filterSelectCls(sort !== 'newest')}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </AdminFilterBar>
  );
}
