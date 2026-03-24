import { useState, type FormEvent } from 'react';
import '../styles/dashboard.css';
import {
  AdminUserLogsProvider,
  useAdminUserLogs,
} from '../context/AdminUserLogsContext';
import ActionTypeBadge from '../component/log/ActionTypeBadge';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const fmtTs = (ts: string | null) => {
  if (!ts) return '-';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const truncate = (str: string | null, n: number) => {
  if (!str) return '-';
  return str.length > n ? str.slice(0, n) + '…' : str;
};

const HEADERS = ['#', '발생시각', '액션', '대상', '경로', '메서드', 'IP', '유저 ID'];

function UserLogsContent() {
  const {
    logs, totalCount, loading, error, hasMore,
    userId, setUserId, clearUserId, loadMore, refresh,
  } = useAdminUserLogs();

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);
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
            <svg className="h-5 w-5" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>
              특정 유저 로그
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {userId != null ? (
                <>
                  유저 ID <span className="font-mono font-bold text-slate-600">#{userId}</span>
                  {' · '}전체 <span className="font-bold text-slate-600">{totalCount.toLocaleString()}</span>건
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            초기화
          </button>
        )}
      </form>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 결과 영역 */}
      {userId == null ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <div className="text-5xl opacity-10">🔍</div>
          <p className="text-sm text-slate-400">유저 ID를 입력하고 조회 버튼을 눌러주세요</p>
          <p className="text-xs text-slate-300">유저 관리 페이지에서 유저 ID를 확인할 수 있습니다</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#0F172A' }}>
                  {HEADERS.map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap uppercase"
                      style={{ color: '#94A3B8' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={HEADERS.length} className="py-16 text-center text-sm text-slate-400">
                      로그가 없습니다.
                    </td>
                  </tr>
                )}
                {logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    style={{ background: i % 2 === 0 ? '#ffffff' : '#FAFBFC' }}
                  >
                    <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {fmtTs(log.timestamp)}
                    </td>
                    <td className="px-4 py-2.5">
                      <ActionTypeBadge type={log.actionType} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      {log.targetType ?? '-'}
                      {log.targetId != null && (
                        <span className="ml-1 text-slate-400">#{log.targetId}</span>
                      )}
                    </td>
                    <td
                      className="max-w-50 px-4 py-2.5 font-mono text-slate-500"
                      title={log.requestUrl ?? ''}
                    >
                      {truncate(log.requestUrl, 35)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">
                      {truncate(log.methodName, 24)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                      {log.ipAddress ?? '-'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">
                      {log.actorId ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 로딩 인디케이터 */}
          {loading && (
            <div className="flex flex-col gap-2 px-6 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-8 w-full rounded" />
              ))}
            </div>
          )}

          {/* 무한 스크롤 sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* 하단 정보 */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
            <span className="text-xs text-slate-400">
              현재 <span className="font-bold text-slate-600">{logs.length.toLocaleString()}</span>
              {' / '}전체 <span className="font-bold text-slate-600">{totalCount.toLocaleString()}</span>건
            </span>
            {!hasMore && logs.length > 0 && (
              <span className="text-xs text-slate-300">모든 로그를 불러왔습니다</span>
            )}
          </div>
        </div>
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
