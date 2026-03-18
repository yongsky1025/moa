import { PieChart, Pie, Cell } from 'recharts';
import type { CircleSurvivalStatsDTO } from '../../types/adminTypes';

interface Props {
  data: CircleSurvivalStatsDTO | null;
  loading: boolean;
}

export default function CircleSurvivalCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card flex h-full flex-col">
        <div className="skeleton mb-4 h-4 w-1/2" />
        <div className="flex flex-1 items-center justify-center">
          <div className="skeleton h-40 w-40 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const inactive = (data?.totalCircle ?? 0) - (data?.activeCircle ?? 0);
  const chartData = [
    { name: '활성', value: data?.activeCircle ?? 0 },
    { name: '비활성', value: inactive < 0 ? 0 : inactive },
  ];
  const rate = data?.survivalRate ?? 0;

  return (
    <div className="admin-card flex h-full flex-col">
      <p className="admin-card-title">모임 생존률</p>

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
            <Cell fill="#D07856" />
            <Cell fill="#F2E8E0" />
          </Pie>
        </PieChart>
        {/* 중앙 텍스트 */}
        <div className="pointer-events-none absolute flex flex-col items-center">
          <span className="text-3xl font-black leading-tight" style={{ color: '#D07856' }}>
            {rate.toFixed(1)}%
          </span>
          <span className="text-[11px]" style={{ color: '#9B7B6A' }}>생존률</span>
        </div>
      </div>

      {/* 수치 요약 */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg py-2" style={{ background: '#FDF0E8' }}>
          <p className="text-lg font-black" style={{ color: '#D07856' }}>
            {(data?.totalCircle ?? 0).toLocaleString('ko-KR')}
          </p>
          <p className="text-[11px]" style={{ color: '#9B7B6A' }}>전체 모임</p>
        </div>
        <div className="rounded-lg py-2" style={{ background: '#ECFDF5' }}>
          <p className="text-lg font-black" style={{ color: '#10B981' }}>
            {(data?.activeCircle ?? 0).toLocaleString('ko-KR')}
          </p>
          <p className="text-[11px]" style={{ color: '#6B7280' }}>활성</p>
        </div>
        <div className="rounded-lg py-2" style={{ background: '#F3F4F6' }}>
          <p className="text-lg font-black" style={{ color: '#9CA3AF' }}>
            {inactive < 0 ? 0 : inactive}
          </p>
          <p className="text-[11px]" style={{ color: '#9B7B6A' }}>비활성</p>
        </div>
      </div>

      <p className="mt-2.5 text-center text-[11px]" style={{ color: '#9B7B6A' }}>
        최근 30일 기준
      </p>
    </div>
  );
}
