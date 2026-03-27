import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { CategoryUsageDTO } from "../../types/adminTypes";

interface Props {
  data: CategoryUsageDTO[];
  loading: boolean;
}

const COLORS = [
  "#5F8F7B",
  "#14B8A6",
  "#F59E0B",
  "#8B5CF6",
  "#6366F1",
  "#F43F5E",
  "#22C55E",
  "#E3886D",
  "#06B6D4",
  "#A78BFA",
];

export default function CategoryUsageCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card">
        <div className="skeleton mb-4 h-4 w-1/3" />
        <div className="flex items-center gap-8">
          <div className="skeleton h-48 w-48 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-8 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="admin-card">
        <p className="admin-card-title">모임 카테고리 × 장소 사용률</p>
        <p className="py-8 text-center text-sm text-gray-300">데이터 없음</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top7 = sorted.slice(0, 7);
  const rest = sorted.slice(7);
  const restCount = rest.reduce((sum, d) => sum + d.count, 0);
  const restPct = rest.reduce((sum, d) => sum + d.percentage, 0);

  const chartData =
    restCount > 0
      ? [
          ...top7,
          { categoryName: "기타", count: restCount, percentage: restPct },
        ]
      : top7;

  return (
    <div className="admin-card">
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-card-title mb-0">모임 카테고리 × 장소 사용률</p>
        <span className="text-[11px] text-moa-subtle">
          장소 예약 {total.toLocaleString("ko-KR")}건 기준
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* 파이 차트 */}
        <div className="shrink-0">
          <PieChart width={220} height={220} style={{ outline: "none" }}>
            <Pie
              data={chartData}
              cx={105}
              cy={105}
              innerRadius={60}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              dataKey="count"
              strokeWidth={1}
              stroke="#fff"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString("ko-KR")}건`,
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
          </PieChart>
        </div>

        {/* 범례 테이블 */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* 헤더 */}
          <div className="mb-1 grid grid-cols-[1fr_4rem_4rem] gap-2 px-1">
            <span className="text-[11px] font-semibold text-moa-subtle">
              카테고리
            </span>
            <span className="text-right text-[11px] font-semibold text-moa-subtle">
              예약수
            </span>
            <span className="text-right text-[11px] font-semibold text-moa-subtle">
              비율
            </span>
          </div>

          {chartData.map((d, i) => (
            <div
              key={d.categoryName}
              className="grid grid-cols-[1fr_4rem_4rem] items-center gap-2 rounded-lg border border-gray-100 px-2.5 py-1.5 hover:bg-gray-50"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="truncate text-xs text-moa-secondary">
                  {d.categoryName}
                </span>
              </div>
              <span className="text-right text-xs font-bold text-moa-text">
                {d.count.toLocaleString("ko-KR")}
              </span>
              <span
                className="text-right text-xs font-semibold"
                style={{ color: COLORS[i % COLORS.length] }}
              >
                {d.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
