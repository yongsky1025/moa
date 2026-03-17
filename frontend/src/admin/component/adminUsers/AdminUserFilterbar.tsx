import { useState } from 'react';
import { useAdminUserList } from '../../context/AdminUsersContext';
import type { UserGender, UserRole } from '../../types/adminTypes';

const GENDER_OPTIONS: { value: UserGender | ''; label: string }[] = [
  { value: '', label: '전체 성별' },
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

const ROLE_OPTIONS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: '전체 권한' },
  { value: 'USER', label: '일반' },
  { value: 'ADMIN', label: '관리자' },
];

export default function AdminUserFilterBar() {
  const { params, applyFilter } = useAdminUserList();

  // UI 전용 로컬 state (DTO와 분리)
  const [nameInput, setNameInput] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [role, setRole] = useState<UserRole | ''>('');

  const hasFilter = !!(params.name || params.gender || params.role);

  const handleSearch = () => {
    applyFilter({
      name: nameInput.trim() || undefined,
      gender: gender || undefined,
      role: role || undefined,
    });
  };

  const handleReset = () => {
    setNameInput('');
    setGender('');
    setRole('');
    applyFilter({ name: undefined, gender: undefined, role: undefined });
  };

  return (
    <div className="border-moa-border flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm">
      {/* 섹션 라벨 */}
      <div className="flex items-center gap-2">
        <div className="bg-moa-primary h-4 w-1 rounded-full" />
        <span className="text-moa-secondary text-xs font-bold tracking-widest uppercase">
          검색 / 필터
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* 이름 검색 */}
        <div className="border-moa-border focus-within:border-moa-primary flex max-w-sm min-w-55 flex-1 items-center gap-2 rounded-xl border bg-[#FDFAF8] px-3 py-2 transition-colors">
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
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="이름 검색"
            className="text-moa-text placeholder:text-moa-subtle flex-1 bg-transparent text-sm outline-none"
          />
          {nameInput && (
            <button
              onClick={() => {
                setNameInput('');
                applyFilter({ name: undefined });
              }}
              className="text-moa-subtle hover:text-moa-primary text-xs transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* 성별 */}
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as UserGender | '')}
          className="border-moa-border text-moa-text hover:border-moa-primary cursor-pointer rounded-xl border bg-[#FDFAF8] px-3 py-2 text-sm transition-colors outline-none"
        >
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* 권한 */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole | '')}
          className="border-moa-border text-moa-text hover:border-moa-primary cursor-pointer rounded-xl border bg-[#FDFAF8] px-3 py-2 text-sm transition-colors outline-none"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* 검색 버튼 */}
        <button
          onClick={handleSearch}
          className="bg-moa-primary hover:bg-moa-hover rounded-xl px-6 py-2 text-sm font-bold text-black shadow-sm transition-colors"
        >
          검색
        </button>

        {/* 초기화 */}
        {hasFilter && (
          <button
            onClick={handleReset}
            className="text-moa-subtle hover:text-moa-primary px-4 py-2 text-sm underline underline-offset-2 transition-colors"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
