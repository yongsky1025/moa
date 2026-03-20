import { useState, type FormEvent } from 'react';
import '../styles/dashboard.css';
import {
  AdminUserLogsProvider,
  useAdminUserLogs,
} from '../context/AdminUserLogsContext';
import LogTable from '../component/log/LogTable';

function UserLogsContent() {
  const {
    logs,
    totalCount,
    actualTotalPage,
    current,
    loading,
    error,
    params,
    userId,
    setUserId,
    clearUserId,
    handlePageChange,
    refresh,
  } = useAdminUserLogs();

  const [inputVal, setInputVal] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const id = parseInt(inputVal.trim(), 10);
    if (!isNaN(id) && id > 0) setUserId(id);
  };

  const handleClear = () => {
    setInputVal('');
    clearUserId();
  };

  return (
    <div
      className="flex min-h-full flex-col gap-5 px-6 py-6"
      style={{ background: '#F8FAFC' }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
            style={{ background: '#0F172A' }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="#94A3B8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#0F172A' }}
            >
              특정 유저 로그
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {userId != null ? (
                <>
                  유저 ID{' '}
                  <span className="font-mono font-bold text-slate-600">
                    #{userId}
                  </span>{' '}
                  · 전체{' '}
                  <span className="font-bold text-slate-600">
                    {totalCount.toLocaleString()}
                  </span>
                  건
                </>
              ) : (
                '유저 ID를 입력하여 조회하세요'
              )}
            </p>
          </div>
        </div>
        {userId != null && (
          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm transition-all hover:bg-slate-50"
          >
            ↻ 새로고침
          </button>
        )}
      </div>

      {/* 검색 폼 */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
      >
        <span className="text-sm font-medium text-slate-500">유저 ID</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
            #
          </span>
          <input
            type="number"
            min={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="숫자 ID 입력"
            className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-7 pr-4 font-mono text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
          style={{ background: '#0F172A' }}
        >
          조회
        </button>
        {userId != null && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-500"
          >
            초기화
          </button>
        )}
      </form>

      {/* 결과 영역 */}
      {userId == null ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <div className="text-5xl opacity-10">🔍</div>
          <p className="text-sm text-slate-400">
            유저 ID를 입력하고 조회 버튼을 눌러주세요
          </p>
          <p className="text-xs text-slate-300">
            유저 관리 페이지에서 유저 ID를 확인할 수 있습니다
          </p>
        </div>
      ) : (
        <LogTable
          logs={logs}
          totalCount={totalCount}
          actualTotalPage={actualTotalPage}
          current={current}
          loading={loading}
          error={error}
          pageSize={params.size}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function AdminUserLogsPage() {
  return (
    <AdminUserLogsProvider>
      <UserLogsContent />
    </AdminUserLogsProvider>
  );
}
