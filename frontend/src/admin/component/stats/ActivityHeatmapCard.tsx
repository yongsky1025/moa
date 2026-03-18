import { useState } from 'react';
import type { ActivityHeatmapStatsDTO } from '../../types/adminTypes';

interface Props {
  data: ActivityHeatmapStatsDTO[];
  loading: boolean;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const BREAKDOWN_ITEMS: {
  key: keyof ActivityHeatmapStatsDTO;
  label: string;
  color: string;
}[] = [
  { key: 'userRegisterCount', label: '신규 가입', color: '#5B8CCC' },
  { key: 'circleCreateCount', label: '모임 생성', color: '#D07856' },
  { key: 'postCount', label: '게시글', color: '#10B981' },
  { key: 'replyCount', label: '댓글', color: '#F59E0B' },
  { key: 'scheduleCount', label: '일정', color: '#8B5CF6' },
];

function normalize(value: number, max: number): number {
  return max === 0 ? 0 : value / max;
}

function heatColor(ratio: number): string {
  if (ratio === 0) return '#F5F0EC';
  if (ratio < 0.2) return '#FDE8D8';
  if (ratio < 0.4) return '#F2BB9B';
  if (ratio < 0.6) return '#F2935C';
  if (ratio < 0.8) return '#D07856';
  return '#B8643D';
}

const EMPTY: ActivityHeatmapStatsDTO = {
  dayOfweek: 0,
  hour: 0,
  activityCount: 0,
  userRegisterCount: 0,
  circleCreateCount: 0,
  postCount: 0,
  replyCount: 0,
  scheduleCount: 0,
};

export default function ActivityHeatmapCard({ data, loading }: Props) {
  const [selected, setSelected] = useState<ActivityHeatmapStatsDTO | null>(
    null,
  );

  if (loading) {
    return (
      <div className="admin-card">
        <div className="skeleton mb-4 h-4 w-2/5" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    );
  }

  const matrix: Record<string, ActivityHeatmapStatsDTO> = {};
  let maxCount = 0;
  for (const d of data) {
    matrix[`${d.dayOfweek}-${d.hour}`] = d;
    if (d.activityCount > maxCount) maxCount = d.activityCount;
  }

  return (
    <div className="admin-card">
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-card-title mb-0">시간대별 활동량</p>
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ background: '#FDF0E8', color: '#D07856' }}
        >
          최근 일주일 기준
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          {/* 시간 라벨 */}
          <div className="mb-1 flex pl-7">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[10px]"
                style={{ color: '#9B7B6A' }}
              >
                {h % 3 === 0 ? `${h}` : ''}
              </div>
            ))}
          </div>

          {/* 히트맵 행 */}
          {DAY_LABELS.map((label, dayIdx) => {
            const dow = dayIdx + 1;
            return (
              <div key={dow} className="mb-0.5 flex items-center gap-1">
                <span
                  className="w-6 shrink-0 text-right text-[11px]"
                  style={{ color: '#9B7B6A' }}
                >
                  {label}
                </span>
                {HOURS.map((h) => {
                  const cell = matrix[`${dow}-${h}`] ?? EMPTY;
                  const ratio = normalize(cell.activityCount, maxCount);
                  const isSelected =
                    selected?.dayOfweek === dow && selected?.hour === h;
                  return (
                    <div
                      key={h}
                      className="flex-1 rounded-sm transition-all duration-100"
                      style={{
                        height: 22,
                        background: heatColor(ratio),
                        cursor: 'pointer',
                        opacity: isSelected ? 1 : undefined,
                        outline: isSelected ? '2px solid #D07856' : undefined,
                        outlineOffset: isSelected ? '1px' : undefined,
                      }}
                      onMouseEnter={() =>
                        setSelected(cell.activityCount > 0 ? cell : null)
                      }
                      onMouseLeave={() => setSelected(null)}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* 범례 */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: '#9B7B6A' }}>
              적음
            </span>
            {[
              '#F5F0EC',
              '#FDE8D8',
              '#F2BB9B',
              '#F2935C',
              '#D07856',
              '#B8643D',
            ].map((c) => (
              <div
                key={c}
                className="h-3.5 w-6 rounded-sm"
                style={{ background: c }}
              />
            ))}
            <span className="text-[11px]" style={{ color: '#9B7B6A' }}>
              많음
            </span>
          </div>
        </div>
      </div>

      {/* 상세 패널 */}
      <div
        className="mt-4 overflow-hidden rounded-xl transition-all duration-200"
        style={{
          border: '1px solid #F2E8E0',
          background: selected ? '#fff' : '#FDFAF8',
          maxHeight: selected ? 160 : 40,
        }}
      >
        {selected ? (
          <div className="px-4 py-3">
            {/* 헤더 */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: '#262626' }}>
                {DAY_LABELS[selected.dayOfweek - 1]}요일&nbsp;{selected.hour}시
              </p>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: '#FDF0E8', color: '#D07856' }}
              >
                총 {selected.activityCount.toLocaleString('ko-KR')}건
              </span>
            </div>

            {/* 유형별 바 */}
            <div className="grid grid-cols-5 gap-2">
              {BREAKDOWN_ITEMS.map(({ key, label, color }) => {
                const count = selected[key] as number;
                const pct =
                  selected.activityCount > 0
                    ? (count / selected.activityCount) * 100
                    : 0;
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: color }}
                        />
                        <span
                          className="text-[11px]"
                          style={{ color: '#9B7B6A' }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: '#262626' }}
                      >
                        {count.toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {/* 비율 바 */}
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: '#F2E8E0' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="text-[10px]" style={{ color: '#9B7B6A' }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="flex h-10 items-center justify-center text-[12px]"
            style={{ color: '#9B7B6A' }}
          >
            셀에 마우스를 올리면 활동 유형별 상세 내역이 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
}
