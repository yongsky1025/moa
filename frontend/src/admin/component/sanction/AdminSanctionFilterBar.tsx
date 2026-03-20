import { useState } from 'react';
import { useAdminSanctions } from '../../context/AdminSanctionsContext';
import type { ReportTargetType, SanctionState, SanctionType } from '../../types/adminTypes';

const STATE_OPTIONS: { value: SanctionState | ''; label: string }[] = [
  { value: '', label: '전체 상태' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'LIFTED', label: '해제' },
  { value: 'CANCELLED', label: '취소' },
];

const TARGET_OPTIONS: { value: ReportTargetType | ''; label: string }[] = [
  { value: '', label: '전체 대상' },
  { value: 'USER', label: '유저' },
  { value: 'POST', label: '게시글' },
  { value: 'REPLY', label: '댓글' },
  { value: 'CIRCLE', label: '모임' },
];

const TYPE_OPTIONS: { value: SanctionType | ''; label: string }[] = [
  { value: '', label: '전체 제재' },
  { value: 'WARNING', label: '경고' },
  { value: 'BAN_1D', label: '1일 정지' },
  { value: 'BAN_3D', label: '3일 정지' },
  { value: 'BAN_30D', label: '30일 정지' },
  { value: 'PERMANENT_BAN', label: '영구 정지' },
  { value: 'CONTENT_DELETE', label: '콘텐츠 삭제' },
];

const filterSelectCls = (active: boolean) =>
  `h-9 cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors ${
    active
      ? 'border-moa-primary bg-moa-light font-semibold text-moa-primary'
      : 'border-moa-border bg-white text-moa-text hover:border-moa-primary'
  }`;

export default function AdminSanctionFilterBar() {
  const { params, applyFilter } = useAdminSanctions();
  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [state, setState] = useState<SanctionState | ''>(params.sanctionState ?? '');
  const [targetType, setTargetType] = useState<ReportTargetType | ''>(params.targetType ?? '');
  const [sanctionType, setSanctionType] = useState<SanctionType | ''>(params.sanctionType ?? '');

  const hasFilter = !!(params.keyword || params.sanctionState || params.targetType || params.sanctionType);

  const handleSearch = () => {
    applyFilter({
      type: keyword.trim() ? 'name' : undefined,
      keyword: keyword.trim() || undefined,
      sanctionState: state || undefined,
      targetType: targetType || undefined,
      sanctionType: sanctionType || undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setState('');
    setTargetType('');
    setSanctionType('');
    applyFilter({ type: undefined, keyword: undefined, sanctionState: undefined, targetType: undefined, sanctionType: undefined });
  };

  return (
    <div className="rounded-2xl border border-moa-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-moa-border px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-moa-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-moa-secondary">검색 및 필터</span>
        </div>
        {hasFilter && (
          <button
            onClick={handleReset}
            className="cursor-pointer text-xs text-moa-subtle underline underline-offset-2 transition-colors hover:text-moa-primary"
          >
            전체 초기화
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
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
                placeholder="대상 유저 이름으로 검색"
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

          <select value={state} onChange={(e) => setState(e.target.value as SanctionState | '')} className={filterSelectCls(!!state)}>
            {STATE_OPTIONS.map((o) => (
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

          <select value={sanctionType} onChange={(e) => setSanctionType(e.target.value as SanctionType | '')} className={filterSelectCls(!!sanctionType)}>
            {TYPE_OPTIONS.map((o) => (
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
      </div>
    </div>
  );
}

