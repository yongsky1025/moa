import type { CircleSummaryDTO, UserCountDTO } from '../../types/adminTypes';

interface Props {
  circleData: CircleSummaryDTO | null;
  userData: UserCountDTO | null;
  loading: boolean;
}

const ACCENT_TOP = [
  'border-t-moa-primary',
  'border-t-moa-muted',
  'border-t-[#C8DDD6]',
];
const BAR_COLORS = [
  '#5F8F7B',
  '#14B8A6',
  '#F59E0B',
  '#8B5CF6',
  '#6366F1',
  '#F43F5E',
  '#22C55E',
];

export default function CircleStatusCard({
  circleData,
  userData,
  loading,
}: Props) {
  const joinRate =
    userData && userData.countTotalUser > 0
      ? Math.round((userData.countJoinUser / userData.countTotalUser) * 100)
      : 0;

  const rawList = circleData?.circleDataDTOs ?? [];

  const sorted = [...rawList].sort(
    (a, b) => b.countPerCategory - a.countPerCategory,
  );
  const top5 = sorted.slice(0, 5);
  const others = sorted.slice(5);
  const otherCount = others.reduce((sum, d) => sum + d.countPerCategory, 0);

  const list =
    otherCount > 0
      ? [...top5, { categoryName: '기타', countPerCategory: otherCount }]
      : top5;

  const maxCount = Math.max(...list.map((d) => d.countPerCategory), 1);

  const summaries = [
    {
      label: '총 모임 수',
      value: circleData ? circleData.circleCount.toLocaleString('ko-KR') : '-',
      unit: '개',
    },
    {
      label: '참여 중인 사용자',
      value: userData ? userData.countJoinUser.toLocaleString('ko-KR') : '-',
      unit: '명',
    },
    {
      label: '모임 참여율',
      value: userData ? `${joinRate}` : '-',
      unit: '%',
    },
  ];

  return (
    <div className="admin-card">
      <h3 className="admin-card-title">모임 현황</h3>

      {/* 상단 요약 3개 */}
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        {summaries.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-xl border border-t-2 border-gray-100 bg-gray-50 p-3 ${ACCENT_TOP[i]}`}
          >
            {loading ? (
              <>
                <div className="skeleton mb-2 h-6 w-3/5" />
                <div className="skeleton h-3 w-1/2" />
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-black tracking-tight text-moa-text">
                    {s.value}
                  </span>
                  <span className="text-xs text-gray-400">{s.unit}</span>
                </div>
                <p className="mt-1 text-[11px] text-moa-subtle">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4 h-px bg-gray-100" />

      {/* 카테고리 분포 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-moa-secondary">
          카테고리별 분포
        </span>
        {circleData && (
          <span className="text-[11px] text-moa-subtle">
            {circleData.circleDataDTOs.length}개 카테고리
          </span>
        )}
      </div>

      {loading || !circleData ? (
        <div className="flex flex-col gap-2.5">
          {[85, 68, 75, 55, 62].map((w, i) => (
            <div key={i} className="skeleton h-7" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-300">데이터 없음</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((d, i) => {
            const pct = Math.round((d.countPerCategory / maxCount) * 100);
            const barPct = Math.round(
              (d.countPerCategory / (circleData.circleCount || 1)) * 100,
            );
            const color = BAR_COLORS[i % BAR_COLORS.length];
            return (
              <div key={d.categoryName} className="flex items-center gap-3">
                {/* 왼쪽: 카테고리명 */}
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="truncate text-xs text-moa-secondary">
                    {d.categoryName}
                  </span>
                </div>

                {/* 오른쪽: 바 + 숫자 */}
                <div className="flex shrink items-center gap-2">
                  <div className="h-1.5 w-xl overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-bold text-moa-text">
                    {d.countPerCategory}
                  </span>
                  <span className="w-7 shrink-0 text-right text-[10px] text-moa-subtle">
                    {barPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
