import '../styles/dashboard.css';
import { AdminLogsProvider, useAdminLogs } from '../context/AdminLogsContext';
import LogTable from '../component/log/LogTable';

function LogsPageContent() {
  const {
    logs,
    totalCount,
    actualTotalPage,
    current,
    loading,
    error,
    params,
    handlePageChange,
    refresh,
  } = useAdminLogs();

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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#0F172A' }}
            >
              전체 활동 로그
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              전체{' '}
              <span className="font-bold text-slate-600">
                {totalCount.toLocaleString()}
              </span>
              건
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm transition-all hover:bg-slate-50"
        >
          ↻ 새로고침
        </button>
      </div>

      {/* 안내 배너 */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <span className="text-slate-300">ℹ</span>
        전체 유저의 활동 로그입니다. 특정 유저 조회는{' '}
        <strong className="text-slate-700">특정 유저 로그</strong> 메뉴를 이용하세요.
      </div>

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
    </div>
  );
}

export default function AdminLogsPage() {
  return (
    <AdminLogsProvider>
      <LogsPageContent />
    </AdminLogsProvider>
  );
}
