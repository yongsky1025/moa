import { useAdminUserDetail } from '../../context/AdminUserDetailContext';
import type { SanctionResponseDTO } from '../../types/adminTypes';

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

const stateLabel = (s?: string) => (s === 'ACTIVE' ? '활성' : s === 'LIFTED' ? '해제' : s === 'CANCELLED' ? '취소' : s ?? '-');

export default function AdminUserSanctionHistorySection() {
  const {
    sanctionHistory,
    loadingSanctionHistory,
    sanctionHistoryError,
  } = useAdminUserDetail();

  const totalCount = sanctionHistory.length;

  return (
    <section className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b border-moa-border px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-moa-primary" />
              <h2 className="text-moa-text text-sm font-black tracking-tight">제재 이력</h2>
            </div>
            <p className="text-moa-subtle mt-1 text-xs">해당 유저가 받은 제재 목록(최신순)입니다.</p>
          </div>
          <div className="text-moa-subtle text-xs">
            총 <span className="text-moa-primary font-bold">{totalCount.toLocaleString()}</span>건
          </div>
        </div>
      </div>

      {sanctionHistoryError && (
        <div className="border-b border-red-100 bg-red-50 px-6 py-4">
          <p className="text-sm text-red-700">{sanctionHistoryError}</p>
        </div>
      )}

      <div className="max-h-125 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-moa-primary">
              {['No.', '제재유형', '상태', '대상', '기간', '사유', '취소'].map((h) => (
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
            {loadingSanctionHistory &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="bg-moa-border h-4 rounded-full" style={{ width: `${55 + (j * 13) % 35}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

            {!loadingSanctionHistory && sanctionHistory.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                      <span className="text-moa-muted text-2xl font-black">0</span>
                    </div>
                    <span className="text-moa-subtle text-sm">제재 이력이 없습니다.</span>
                  </div>
                </td>
              </tr>
            )}

            {!loadingSanctionHistory &&
              sanctionHistory.map((s: SanctionResponseDTO, idx: number) => {
                const no = totalCount - idx;
                const state = String(s?.sanctionState ?? '');
                const statePill =
                  state === 'CANCELLED'
                    ? 'bg-gray-100 text-gray-600'
                    : state === 'LIFTED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700';

                return (
                  <tr key={String(s.sanctionId)} className="hover:bg-moa-light/30 transition-colors">
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs whitespace-nowrap">{no}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-moa-text font-semibold">{String(s.sanctionType ?? '-')}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statePill}`}>
                        {stateLabel(state)}
                      </span>
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 whitespace-nowrap text-xs font-mono">
                      {String(s.targetType ?? '-')} #{String(s.targetId ?? '-')}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 whitespace-nowrap text-xs font-mono">
                      {formatDateTime(s.startAt)} ~ {s.endAt ? formatDateTime(s.endAt) : '∞'}
                    </td>
                    <td className="text-moa-secondary px-5 py-3.5 min-w-[260px]">
                      <div className="line-clamp-2 text-xs">{String(s.reason ?? '-')}</div>
                    </td>
                    <td className="text-moa-subtle px-5 py-3.5 min-w-[220px] text-xs">
                      {state === 'CANCELLED' ? (
                        <div className="space-y-1">
                          <div className="font-mono">{formatDateTime(s.cancelledAt)}</div>
                          <div className="line-clamp-2">{String(s.cancelReason ?? '-')}</div>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
