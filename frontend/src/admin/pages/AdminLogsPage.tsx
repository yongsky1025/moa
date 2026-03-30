import "../styles/dashboard.css";
import { AdminLogsProvider, useAdminLogs } from "../context/AdminLogsContext";
import ActionTypeBadge from "../component/log/ActionTypeBadge";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

const fmtTs = (ts: string | null) => {
  if (!ts) return "-";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const truncate = (str: string | null, n: number) => {
  if (!str) return "-";
  return str.length > n ? str.slice(0, n) + "…" : str;
};

const HEADERS = [
  "#",
  "발생시각",
  "액션",
  "대상",
  "경로",
  "메서드",
  "IP",
  "유저 ID",
];

function LogsPageContent() {
  const { logs, totalCount, loading, error, hasMore, loadMore, refresh } =
    useAdminLogs();
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

  return (
    <div
      className="flex min-h-full flex-col gap-5 px-6 py-6"
      style={{ background: "#F8FAFC" }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
            style={{ background: "#0F172A" }}
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
              style={{ color: "#0F172A" }}
            >
              전체 활동 로그
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              전체{" "}
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
        전체 유저의 활동 로그입니다. 특정 유저 조회는{" "}
        <strong className="text-slate-700">특정 유저 로그</strong> 메뉴를
        이용하세요.
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#0F172A" }}>
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap uppercase"
                    style={{ color: "#94A3B8" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={HEADERS.length}
                    className="py-16 text-center text-sm text-slate-400"
                  >
                    로그가 없습니다.
                  </td>
                </tr>
              )}
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#FAFBFC" }}
                >
                  <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                    {fmtTs(log.timestamp)}
                  </td>
                  <td className="px-4 py-2.5">
                    <ActionTypeBadge type={log.actionType} />
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                    {log.targetType ?? "-"}
                    {log.targetId != null && (
                      <span className="ml-1 text-slate-400">
                        #{log.targetId}
                      </span>
                    )}
                  </td>
                  <td
                    className="max-w-50 px-4 py-2.5 font-mono text-slate-500"
                    title={log.requestUrl ?? ""}
                  >
                    {truncate(log.requestUrl, 35)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">
                    {truncate(log.methodName, 24)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                    {log.ipAddress ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">
                    {log.actorId ?? "-"}
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
            현재{" "}
            <span className="font-bold text-slate-600">
              {logs.length.toLocaleString()}
            </span>
            {" / "}전체{" "}
            <span className="font-bold text-slate-600">
              {totalCount.toLocaleString()}
            </span>
            건
          </span>
          {!hasMore && logs.length > 0 && (
            <span className="text-xs text-slate-300">
              모든 로그를 불러왔습니다
            </span>
          )}
        </div>
      </div>
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
