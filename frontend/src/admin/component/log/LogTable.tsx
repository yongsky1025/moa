import type { AdminActionLog } from "../../types/adminTypes";
import ActionTypeBadge from "./ActionTypeBadge";
import MoaPaginate from "../Moapaginate";

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

interface Props {
  logs: AdminActionLog[];
  totalCount: number;
  actualTotalPage: number;
  current: number;
  loading: boolean;
  error: string | null;
  pageSize: number;
  onPageChange: (e: { selected: number }) => void;
}

export default function LogTable({
  logs,
  totalCount,
  actualTotalPage,
  current,
  loading,
  error,
  pageSize,
  onPageChange,
}: Props) {
  const startNo = (current - 1) * pageSize + 1;

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 p-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {error && (
        <div className="border-b border-red-100 bg-red-50 px-6 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="py-16 text-center text-sm text-slate-400"
                >
                  로그가 없습니다.
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#FAFBFC" }}
                >
                  <td className="px-4 py-2.5 text-slate-400">{startNo + i}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
        <span className="text-xs text-slate-400">
          전체{" "}
          <span className="font-bold text-slate-600">
            {totalCount.toLocaleString()}
          </span>
          건
        </span>
        {actualTotalPage > 1 && (
          <MoaPaginate
            pageCount={actualTotalPage}
            currentPage={current}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
