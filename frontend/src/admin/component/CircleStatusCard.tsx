import type { CircleSummaryDTO, UserCountDTO } from '../types/adminTypes';

interface Props {
  circleData: CircleSummaryDTO | null;
  userData: UserCountDTO | null;
  loading: boolean;
}

const BAR_COLORS = [
  '#5b8dee',
  '#34c77b',
  '#f5a623',
  '#e88a9a',
  '#a47ef5',
  '#38bdf8',
  '#fb923c',
];
const ACCENT_TOP = [
  'border-t-blue-400',
  'border-t-emerald-400',
  'border-t-amber-400',
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

  const list = circleData?.circleDataDTOs ?? [];
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
                  <span className="text-xl font-black tracking-tight text-gray-900">
                    {s.value}
                  </span>
                  <span className="text-xs text-gray-400">{s.unit}</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4 h-px bg-gray-100" />

      {/* 카테고리 분포 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          카테고리별 분포
        </span>
        {circleData && (
          <span className="text-[11px] text-gray-300">
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
              <div key={d.categoryName}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="text-xs text-gray-600">
                      {d.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">
                      {d.countPerCategory}개
                    </span>
                    <span className="w-7 text-right text-[10px] text-gray-300">
                      {barPct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
