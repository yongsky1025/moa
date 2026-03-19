// components/adminUsers/AdminUserFilterBar.tsx
import { useState } from 'react';
import { useAdminUserList } from '../../context/AdminUsersContext';
import type { UserGender, UserRole, UserStatus } from '../../types/adminTypes';

// ─── 검색 타입 ─────────────────────────────────────────────────────────────────
type SearchType = '' | 'name' | 'id' | 'age' | 'birth';

const SEARCH_TYPE_OPTIONS: {
  value:       SearchType;
  label:       string;
  placeholder: string;
  inputMode?:  'text' | 'numeric';
  hint?:       string;
}[] = [
  {
    value:       '',
    label:       '검색 조건',   // ★ default — 모임관리와 동일
    placeholder: '검색 조건을 먼저 선택하세요(미선택 시 조건 없이 검색)',
  },
  { value: 'name',  label: '이름',    placeholder: '이름을 입력하세요' },
  { value: 'id',    label: '회원 ID', placeholder: '숫자 입력 (예: 42)',                inputMode: 'numeric' },
  { value: 'age',   label: '나이',    placeholder: '숫자 입력 (예: 25)',                inputMode: 'numeric' },
  {
    value:       'birth',
    label:       '생년월일',
    placeholder: '숫자만 입력 (예: 1995 / 199503 / 19950315)',
    inputMode:   'numeric',
    hint:        '연도 4자리 · 연월 6자리 · 연월일 8자리만 지원',
  },
];

const GENDER_OPTIONS: { value: UserGender | ''; label: string }[] = [
  { value: '',            label: '전체 성별'  },
  { value: 'MALE',        label: '남성'      },
  { value: 'FEMALE',      label: '여성'      },
  { value: 'UNSPECIFIED', label: '알 수 없음' },
];

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '',          label: '전체 상태' },
  { value: 'ACTIVE',    label: '활성'     },
  { value: 'SUSPENDED', label: '정지'     },
  { value: 'BANNED',    label: '영구정지'  },
  { value: 'WITHDRAWN', label: '탈퇴'     },
];

const ROLE_OPTIONS: { value: UserRole | ''; label: string }[] = [
  { value: '',      label: '전체 권한' },
  { value: 'USER',  label: '일반'     },
  { value: 'ADMIN', label: '관리자'   },
];

const isBirthValid = (val: string) =>
  /^\d+$/.test(val) && [4, 6, 8].includes(val.length);

const BIRTH_EXAMPLES = [
  { val: '1995',     desc: '1995년생 전체'    },
  { val: '199503',   desc: '1995년 3월생'     },
  { val: '19950315', desc: '1995년 3월 15일생' },
];

const findLabel = (options: { value: string; label: string }[], value: string) =>
  options.find(o => o.value === value)?.label ?? value;

const filterSelectCls = (active: boolean) =>
  `h-9 cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors ${
    active
      ? 'border-moa-primary bg-moa-light font-semibold text-moa-primary'
      : 'border-moa-border bg-white text-moa-text hover:border-moa-primary'
  }`;

export default function AdminUserFilterBar() {
  const { params, applyFilter } = useAdminUserList();

  // ★ 기본값 '' — 조건선택 상태
  const [searchType, setSearchType] = useState<SearchType>('');
  const [keyword,    setKeyword   ] = useState('');
  const [gender,     setGender    ] = useState<UserGender | ''>('');
  const [status,     setStatus    ] = useState<UserStatus | ''>('');
  const [role,       setRole      ] = useState<UserRole   | ''>('');
  const [birthError, setBirthError] = useState('');

  const currentOpt  = SEARCH_TYPE_OPTIONS.find(o => o.value === searchType)!;
  const hasFilter   = !!(params.keyword || params.gender || params.status || params.role);
  const activeCount = [params.keyword, params.gender, params.status, params.role].filter(Boolean).length;

  const handleTypeChange = (t: SearchType) => {
    setSearchType(t);
    setKeyword('');
    setBirthError('');
  };

  const handleSearch = () => {
    if (searchType === 'birth' && keyword && !isBirthValid(keyword)) {
      setBirthError('숫자만 입력, 4자리(연도) · 6자리(연월) · 8자리(연월일)만 가능합니다.');
      return;
    }
    setBirthError('');
    applyFilter({
      type:    keyword.trim() && searchType ? searchType : undefined,
      keyword: keyword.trim() || undefined,
      gender:  gender  || undefined,
      status:  status  || undefined,
      role:    role    || undefined,
    });
  };

  const handleReset = () => {
    setSearchType('');
    setKeyword('');
    setGender('');
    setStatus('');
    setRole('');
    setBirthError('');
    applyFilter({ type: undefined, keyword: undefined, gender: undefined, status: undefined, role: undefined });
  };

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
            onClick={handleReset}
            className="cursor-pointer text-xs text-moa-subtle underline underline-offset-2 transition-colors hover:text-moa-primary"
          >
            전체 초기화
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">

        {/* ── 검색행 ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">

            {/* 검색 타입 select */}
            <select
              value={searchType}
              onChange={e => handleTypeChange(e.target.value as SearchType)}
              className={`h-10 cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors
                ${searchType
                  ? 'border-moa-primary bg-moa-light font-semibold text-moa-primary'
                  : 'border-moa-border bg-white text-moa-text hover:border-moa-primary'
                }`}
            >
              {SEARCH_TYPE_OPTIONS.map(o => (
                <option
                  key={o.value}
                  value={o.value}
                  className="bg-white text-moa-text"
                >
                  {o.label}
                </option>
              ))}
            </select>

            {/* 키워드 입력 */}
            <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-moa-border bg-moa-light px-3 transition-colors focus-within:border-moa-primary focus-within:bg-white">
              <svg className="h-4 w-4 shrink-0 text-moa-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={keyword}
                onChange={e => { setKeyword(e.target.value); if (birthError) setBirthError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={currentOpt?.placeholder ?? '검색 조건을 먼저 선택하세요'}
                inputMode={currentOpt?.inputMode ?? 'text'}
                className="flex-1 bg-transparent text-sm text-moa-text outline-none placeholder:text-moa-subtle"
              />
              {keyword && (
                <button
                  onClick={() => { setKeyword(''); setBirthError(''); applyFilter({ type: undefined, keyword: undefined }); }}
                  className="cursor-pointer text-xs text-moa-subtle transition-colors hover:text-moa-primary"
                >✕</button>
              )}
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              className="h-10 cursor-pointer rounded-lg bg-moa-primary px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-moa-hover"
            >
              검색
            </button>
          </div>

          {/* birth 힌트 */}
          {searchType === 'birth' && !birthError && (
            <p className="flex items-center gap-1.5 text-xs text-moa-subtle">
              <svg className="h-3.5 w-3.5 shrink-0 text-moa-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {currentOpt.hint}
            </p>
          )}

          {/* birth 에러 */}
          {birthError && (
            <p className="text-xs font-medium text-red-500">⚠ {birthError}</p>
          )}
        </div>

        {/* birth 예시 태그 */}
        {searchType === 'birth' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-moa-subtle">예시:</span>
            {BIRTH_EXAMPLES.map(ex => (
              <button
                key={ex.val}
                onClick={() => { setKeyword(ex.val); setBirthError(''); }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-moa-border bg-moa-light px-2.5 py-1 font-mono text-xs text-moa-primary transition-colors hover:border-moa-primary hover:bg-white"
              >
                <strong>{ex.val}</strong>
                <span className="font-sans font-normal text-moa-subtle">— {ex.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── 필터행 ── */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-moa-subtle">필터</span>
          <div className="h-4 w-px bg-moa-border" />

          <select value={gender} onChange={e => setGender(e.target.value as UserGender | '')} className={filterSelectCls(!!gender)}>
            {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select value={status} onChange={e => setStatus(e.target.value as UserStatus | '')} className={filterSelectCls(!!status)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select value={role} onChange={e => setRole(e.target.value as UserRole | '')} className={filterSelectCls(!!role)}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={handleSearch}
            className="h-9 cursor-pointer rounded-lg border border-moa-primary px-4 text-sm font-medium text-moa-primary transition-colors hover:bg-moa-light"
          >
            적용
          </button>
        </div>

        {/* ── 적용된 필터 태그 ── */}
        {hasFilter && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-moa-subtle">적용됨:</span>
            {params.keyword && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moa-primary px-3 py-1 text-xs font-semibold text-white">
                {findLabel(SEARCH_TYPE_OPTIONS, params.type ?? '')} : {params.keyword}
                <button onClick={() => { setKeyword(''); applyFilter({ type: undefined, keyword: undefined }); }} className="cursor-pointer opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {params.gender && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moa-primary px-3 py-1 text-xs font-semibold text-white">
                {findLabel(GENDER_OPTIONS, params.gender)}
                <button onClick={() => { setGender(''); applyFilter({ gender: undefined }); }} className="cursor-pointer opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {params.status && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moa-primary px-3 py-1 text-xs font-semibold text-white">
                {findLabel(STATUS_OPTIONS, params.status)}
                <button onClick={() => { setStatus(''); applyFilter({ status: undefined }); }} className="cursor-pointer opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {params.role && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moa-primary px-3 py-1 text-xs font-semibold text-white">
                {findLabel(ROLE_OPTIONS, params.role)}
                <button onClick={() => { setRole(''); applyFilter({ role: undefined }); }} className="cursor-pointer opacity-70 hover:opacity-100">×</button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}