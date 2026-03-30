import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface Props {
  rate: number | null;
  loading: boolean;
}

export default function PlaceUtilizationCard({ rate, loading }: Props) {
  const value = rate ?? 0;
  const chartData = [{ value }];

  // 색상: 50% 미만 주황, 50~80% 모아 그린, 80%+ 강조 그린
  const color = value >= 80 ? "#10B981" : value >= 50 ? "#5F8F7B" : "#E3886D";

  return (
    <div className="admin-card flex h-full flex-col">
      <h3 className="admin-card-title">장소 이용률</h3>

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="skeleton h-28 w-28 rounded-full" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* 반원 게이지 */}
          <div className="relative" style={{ width: 180, height: 100 }}>
            <RadialBarChart
              width={180}
              height={110}
              cx={90}
              cy={100}
              innerRadius={55}
              outerRadius={85}
              startAngle={180}
              endAngle={0}
              data={chartData}
              style={{ outline: "none" }}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: "#E5E7EB" }}
                fill={color}
                angleAxisId={0}
              />
            </RadialBarChart>

            {/* 중앙 수치 */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1">
              <span
                className="text-3xl font-black leading-tight tracking-tight"
                style={{ color }}
              >
                {value.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 수치 요약 */}
          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-gray-100 bg-gray-50 py-2.5">
              <p className="text-lg font-black" style={{ color }}>
                {value.toFixed(1)}%
              </p>
              <p className="text-[11px] text-moa-subtle">이용률</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 py-2.5">
              <p className="text-lg font-black text-moa-subtle">
                {(100 - value).toFixed(1)}%
              </p>
              <p className="text-[11px] text-moa-subtle">미이용</p>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-moa-subtle">
            ACTIVE 장소 · 최근 30일 기준
          </p>
        </div>
      )}
    </div>
  );
}
