import { useNavigate } from 'react-router-dom';
import { useAdminCircles } from '../../context/AdminCirclesContext';
import AdminCircleStatusBadge from './AdminCircleStatusBadge';
import MoaPaginate from '../Moapaginate';

const HEADERS = ['No.', '모임명', '카테고리', '리더', '인원', '상태', ''];

export default function AdminCircleTable() {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    actualTotalPage,
    params,
    handlePageChange,
  } = useAdminCircles();

  const circles = data?.dtoList ?? [];
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
              {HEADERS.map((h, i) => (
                <th key={i} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-white opacity-90 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-moa-border divide-y">
            {/* 로딩 스켈레톤 */}
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="bg-moa-border h-4 rounded-full" style={{ width: `${60 + (j * 17) % 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}

            {/* 빈 결과 */}
            {!loading && circles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                      <span className="text-moa-muted text-2xl">◎</span>
                    </div>
                    <span className="text-moa-subtle text-sm">조건에 맞는 모임이 없습니다.</span>
                  </div>
                </td>
              </tr>
            )}

            {/* 데이터 행 */}
            {!loading && circles.map((c, idx) => {
              const no = totalCount - ((current - 1) * (params.size ?? 5)) - idx;
              return (
                <tr
                  key={c.circleId}
                  onClick={() => navigate(`/admin/circles/${c.circleId}`)}
                  className="group cursor-pointer transition-colors hover:bg-moa-light/30"
                >
                  <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs">{no}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-moa-text group-hover:text-moa-primary font-semibold transition-colors whitespace-nowrap">
                      {c.circleName}
                    </span>
                  </td>
                  <td className="text-moa-secondary whitespace-nowrap px-5 py-3.5">{c.categoryName}</td>
                  <td className="text-moa-secondary whitespace-nowrap px-5 py-3.5">{c.leaderName ?? '-'}</td>
                  <td className="text-moa-secondary whitespace-nowrap px-5 py-3.5">
                    <span className="text-moa-primary font-semibold">{c.currentMember}</span>
                    <span className="text-moa-subtle">/{c.maxMember}</span>
                  </td>
                  <td className="px-5 py-3.5"><AdminCircleStatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/circles/${c.circleId}`)}
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

      {/* 페이지네이션 */}
      {!loading && actualTotalPage > 1 && (
        <div className="border-moa-border flex flex-col items-center gap-3 border-t px-6 py-5">
          <MoaPaginate
            pageCount={actualTotalPage}
            currentPage={current}
            onPageChange={handlePageChange}
          />
          <p className="text-moa-subtle text-xs">
            <span className="text-moa-secondary font-semibold">{current}</span> / {actualTotalPage} 페이지
            &nbsp;·&nbsp;
            총 <span className="text-moa-primary font-semibold">{totalCount.toLocaleString()}</span>개
          </p>
        </div>
      )}
    </div>
  );
}
