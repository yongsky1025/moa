import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AgeCategoryRetentionStatsDTO } from '../../types/adminTypes';

interface Props {
  data: AgeCategoryRetentionStatsDTO[];
  loading: boolean;
}

function rateToColor(rate: number): string {
  if (rate >= 80) return '#10B981';
  if (rate >= 60) return '#34D399';
  if (rate >= 40) return '#D07856';
  if (rate >= 20) return '#F2935C';
  return '#FCA5A5';
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs shadow-lg"
      style={{ background: '#fff', border: '1px solid #F2E8E0', color: '#262626' }}
    >
      <p className="mb-1 font-bold" style={{ color: '#D07856' }}>
        {d.categoryName}
      </p>
      <p>
        유지율{' '}
        <span className="font-black">{Number(d.rate).toFixed(1)}%</span>
      </p>
      <p style={{ color: '#9B7B6A' }}>
        유지 {d.retainedMembers.toLocaleString('ko-KR')}명 / 전체{' '}
        {d.totalMembers.toLocaleString('ko-KR')}명
      </p>
    </div>
  );
}

export default function AgeCategoryRetentionCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card">
        <div className="skeleton mb-4 h-4 w-2/5" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const ageGroups = [...new Set(data.map((d) => d.ageGroup))].sort();
  const avg =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.rate, 0) / data.length
      : 0;

  return (
    <div className="admin-card">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-card-title mb-0">연령대 × 카테고리별 모임 유지율</p>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: '#9B7B6A' }}
          >
            <span>낮음</span>
            {['#FCA5A5', '#F2935C', '#D07856', '#34D399', '#10B981'].map((c) => (
              <div
                key={c}
                className="h-3 w-3 rounded-full"
                style={{ background: c }}
              />
            ))}
            <span>높음</span>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: '#FDF0E8', color: '#D07856' }}
          >
            유지율 %
          </span>
        </div>
      </div>

      {/* 패널 그리드 — 연령대별 소형 바 차트 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {ageGroups.map((ageGroup) => {
          const panelData = data
            .filter((d) => d.ageGroup === ageGroup)
            .sort((a, b) => b.rate - a.rate);

          const panelHeight = Math.max(120, panelData.length * 28 + 40);

          return (
            <div
              key={ageGroup}
              className="rounded-xl border p-3"
              style={{ borderColor: '#F2E8E0', background: '#FDFAF8' }}
            >
              <p
                className="mb-2 text-xs font-bold"
                style={{ color: '#B8643D' }}
              >
                {ageGroup}
              </p>
              <ResponsiveContainer width="100%" height={panelHeight}>
                <BarChart
                  data={panelData}
                  layout="vertical"
                  margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: '#9B7B6A' }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                    tickCount={5}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    width={72}
                    tick={{ fontSize: 10, fill: '#6B4F3A' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(208,120,86,0.07)' }}
                  />
                  <Bar
                    dataKey="rate"
                    maxBarSize={14}
                    shape={(props: any) => {
                      const { x, y, width, height } = props;
                      if (!width || width <= 0) return <g />;
                      return (
                        <rect
                          x={x}
                          y={y + 1}
                          width={Math.max(0, width)}
                          height={Math.max(0, height - 2)}
                          fill={rateToColor(props.rate)}
                          rx={3}
                          ry={3}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* 평균 유지율 */}
      {data.length > 0 && (
        <div
          className="mt-3 rounded-xl px-4 py-2.5 text-center text-sm"
          style={{ background: '#FDF0E8' }}
        >
          전체 평균 유지율&nbsp;
          <span className="font-black" style={{ color: '#D07856' }}>
            {avg.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
