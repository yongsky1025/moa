import { PieChart, Pie, Cell } from "recharts";
import type { PlaceConversionRateDTO } from "../../types/adminTypes";

interface Props {
  data: PlaceConversionRateDTO | null;
  loading: boolean;
}

export default function PlaceConversionCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card flex h-full flex-col">
        <div className="skeleton mb-4 h-4 w-1/2" />
        <div className="flex flex-1 items-center justify-center">
          <div className="skeleton h-40 w-40 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const rate = data?.rate ?? 0;
  const linked = data?.linkedSchedules ?? 0;
  const total = data?.totalSchedules ?? 0;
  const unlinked = Math.max(0, total - linked);

  const chartData = [
    { name: "장소 연계", value: linked },
    { name: "미연계", value: unlinked === 0 && linked === 0 ? 1 : unlinked },
  ];

  const color = rate >= 60 ? "#5F8F7B" : rate >= 30 ? "#14B8A6" : "#E3886D";

  return (
    <div className="admin-card flex h-full flex-col">
      <p className="admin-card-title">장소 연계율</p>

      {/* 도넛 차트 */}
      <div className="relative flex flex-1 items-center justify-center">
        <PieChart width={180} height={180}>
          <Pie
            data={chartData}
            cx={85}
            cy={85}
            innerRadius={58}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>
        {/* 중앙 텍스트 */}
        <div className="pointer-events-none absolute flex flex-col items-center">
          <span className="text-3xl font-black leading-tight" style={{ color }}>
            {rate.toFixed(1)}%
          </span>
          <span className="text-[11px]" style={{ color: "#6B7280" }}>
            연계율
          </span>
        </div>
      </div>

      {/* 수치 요약 */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg py-2" style={{ background: "#EAF4F0" }}>
          <p className="text-lg font-black" style={{ color }}>
            {linked.toLocaleString("ko-KR")}
          </p>
          <p className="text-[11px]" style={{ color: "#6B7280" }}>
            장소 연계 일정
          </p>
        </div>
        <div className="rounded-lg py-2" style={{ background: "#F3F4F6" }}>
          <p className="text-lg font-black" style={{ color: "#9CA3AF" }}>
            {total.toLocaleString("ko-KR")}
          </p>
          <p className="text-[11px]" style={{ color: "#6B7280" }}>
            전체 일정
          </p>
        </div>
      </div>

      <p
        className="mt-2.5 text-center text-[11px]"
        style={{ color: "#6B7280" }}
      >
        일정 생성 시 장소 지정 비율
      </p>
    </div>
  );
}
