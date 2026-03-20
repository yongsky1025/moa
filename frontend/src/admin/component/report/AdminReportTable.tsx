import { useNavigate } from 'react-router-dom';
import type { ReportResponseDTO } from '../../types/adminTypes';
import { useAdminReports } from '../../context/AdminReportsContext';
import AdminReportStatusBadge from './AdminReportStatusBadge';
import MoaPaginate from '../Moapaginate';

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
};

const HEADERS = ['No.', '신고자', '대상', '대상 ID', '유형', '상태', '접수일', ''];

export default function AdminReportTable() {
  const navigate = useNavigate();
  const { data, loading, error, params, actualTotalPage, handlePageChange } = useAdminReports();

  const list = data?.dtoList ?? [];
  const totalCount = data?.totalCount ?? 0;
  const current = data?.current ?? 1;

  return (
    <div className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
      {error && (
        <div className="border-b border-red-100 bg-red-50 px-6 py-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-moa-primary">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap opacity-90"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-moa-border">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: HEADERS.length }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="bg-moa-border h-4 rounded-full" style={{ width: `${60 + (j * 17) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={HEADERS.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                      <span className="text-moa-muted text-2xl font-black">0</span>
                    </div>
                    <span className="text-moa-subtle text-sm">신고 내역이 없습니다.</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              list.map((r: ReportResponseDTO, idx: number) => {
                const no = totalCount - (current - 1) * (params.size ?? 20) - idx;
                return (
                  <tr
                    key={r.reportId}
                    onClick={() => navigate(`/admin/reports/${r.reportId}`)}
                    className="group cursor-pointer transition-colors hover:bg-moa-light/30"
                  >
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs whitespace-nowrap">{no}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-moa-text group-hover:text-moa-primary font-semibold transition-colors whitespace-nowrap">
                        {r.reporterName}
                      </span>
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 whitespace-nowrap text-xs font-mono">{String(r.targetType)}</td>
                    <td className="text-moa-secondary px-5 py-3.5 whitespace-nowrap text-xs font-mono">{r.targetId}</td>
                    <td className="text-moa-secondary px-5 py-3.5 whitespace-nowrap text-xs font-mono">{String(r.category)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <AdminReportStatusBadge status={r.status} />
                    </td>
                    <td className="text-moa-subtle px-5 py-3.5 whitespace-nowrap text-xs font-mono">{formatDateTime(r.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/admin/reports/${r.reportId}`)}
                        className="bg-moa-primary hover:bg-moa-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-all group-hover:opacity-100 whitespace-nowrap"
                      >
                        상세보기
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!loading && actualTotalPage > 1 && (
        <div className="border-moa-border flex flex-col items-center gap-3 border-t px-6 py-5">
          <MoaPaginate pageCount={actualTotalPage} currentPage={current} onPageChange={handlePageChange} />
          <p className="text-moa-subtle text-xs">
            <span className="text-moa-secondary font-semibold">{current}</span> / {actualTotalPage} 페이지
            &nbsp;·&nbsp;총 <span className="text-moa-primary font-semibold">{totalCount.toLocaleString()}</span>건
          </p>
        </div>
      )}
    </div>
  );
}

