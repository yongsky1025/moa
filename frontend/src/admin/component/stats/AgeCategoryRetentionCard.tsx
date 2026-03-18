import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AgeCategoryRetentionStatsDTO } from '../../types/adminTypes';

interface Props {
  data: AgeCategoryRetentionStatsDTO[];
  loading: boolean;
}

/** 유지율(0~100) → 색상 */
function rateToColor(rate: number): string {
  if (rate >= 80) return '#10B981'; // 초록
  if (rate >= 60) return '#34D399'; // 연초록
  if (rate >= 40) return '#D07856'; // MOA primary
  if (rate >= 20) return '#F2935C'; // MOA muted
  return '#FCA5A5';                 // 연빨강
}

/** 커스텀 버블 렌더 함수 — Recharts v3 shape render function 형태 */
function renderBubble(props: any) {
  const { cx, cy, r, payload } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r ?? 10}
      fill={rateToColor(payload?.z ?? 0)}
      fillOpacity={0.85}
      stroke="none"
      style={{ outline: 'none', cursor: 'default' }}
    />
  );
}

/** 커스텀 툴팁 */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs shadow-lg"
      style={{ background: '#fff', border: '1px solid #F2E8E0', color: '#262626' }}
    >
      <p className="mb-1 font-bold" style={{ color: '#D07856' }}>
        {d.ageGroup} × {d.categoryName}
      </p>
      <p>유지율 <span className="font-black">{d.rate.toFixed(1)}%</span></p>
      <p style={{ color: '#9B7B6A' }}>
        유지 {d.retainedMembers.toLocaleString('ko-KR')}명 / 전체 {d.totalMembers.toLocaleString('ko-KR')}명
      </p>
    </div>
  );
}

export default function AgeCategoryRetentionCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card">
        <div className="skeleton mb-4 h-4 w-2/5" />
        <div className="skeleton h-60 w-full rounded-lg" />
      </div>
    );
  }

  const ageGroups  = [...new Set(data.map(d => d.ageGroup))].sort();
  const categories = [...new Set(data.map(d => d.categoryName))].sort();

  // 버블 데이터: x=연령대 인덱스, y=카테고리 인덱스, z=유지율
  const chartData = data.map(d => ({
    x: ageGroups.indexOf(d.ageGroup),
    y: categories.indexOf(d.categoryName),
    z: d.rate,
    ageGroup: d.ageGroup,
    categoryName: d.categoryName,
    totalMembers: d.totalMembers,
    retainedMembers: d.retainedMembers,
    rate: d.rate,
  }));

  const chartHeight = Math.max(240, categories.length * 44 + 60);

  return (
    <div className="admin-card">
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-card-title mb-0">연령대 × 카테고리별 모임 유지율</p>
        <div className="flex items-center gap-3">
          {/* 범례 */}
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#9B7B6A' }}>
            <span>낮음</span>
            {['#FCA5A5', '#F2935C', '#D07856', '#34D399', '#10B981'].map(c => (
              <div key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
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

      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[-0.5, ageGroups.length - 0.5]}
            ticks={ageGroups.map((_, i) => i)}
            tickFormatter={i => ageGroups[i] ?? ''}
            tick={{ fontSize: 12, fill: '#9B7B6A' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[-0.5, categories.length - 0.5]}
            ticks={categories.map((_, i) => i)}
            tickFormatter={i => categories[i] ?? ''}
            tick={{ fontSize: 12, fill: '#9B7B6A' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          {/* z 범위: 버블 크기 조정 */}
          <ZAxis type="number" dataKey="z" range={[200, 1200]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />
          <Scatter
            data={chartData}
            isAnimationActive={false}
            shape={renderBubble}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* 하단 평균 유지율 */}
      {data.length > 0 && (() => {
        const avg = data.reduce((sum, d) => sum + d.rate, 0) / data.length;
        return (
          <div
            className="mt-3 rounded-xl px-4 py-2.5 text-center text-sm"
            style={{ background: '#FDF0E8' }}
          >
            전체 평균 유지율&nbsp;
            <span className="font-black" style={{ color: '#D07856' }}>
              {avg.toFixed(1)}%
            </span>
          </div>
        );
      })()}
    </div>
  );
}
