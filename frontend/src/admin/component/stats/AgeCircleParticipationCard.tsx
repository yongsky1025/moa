import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AgeGroupStatsDTO } from '../../types/adminTypes';

interface Props {
  data: AgeGroupStatsDTO[];
  loading: boolean;
}

const MALE_COLOR   = '#5B8CCC';
const FEMALE_COLOR = '#E07E9C';
const OTHER_COLOR  = '#9B7B6A';

export default function AgeCircleParticipationCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card h-full">
        <div className="skeleton mb-4 h-4 w-2/5" />
        <div className="skeleton h-52 w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: d.ageGroup,
    a: d.countMale,
    b: d.countFemale,
    c: d.countOther,
  }));

  return (
    <div className="admin-card h-full">
      <div className="mb-4">
        <p className="admin-card-title mb-0">연령대별 모임 참여자</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2E8E0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#9B7B6A' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9B7B6A' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid #F2E8E0',
              borderRadius: '0.75rem',
              fontSize: 12,
              color: '#262626',
            }}
            cursor={{ fill: '#FDF0E8' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#9B7B6A', paddingTop: 8 }}
          />
          <Bar dataKey="a" name="남성" fill={MALE_COLOR}   radius={[4, 4, 0, 0]} />
          <Bar dataKey="b" name="여성" fill={FEMALE_COLOR} radius={[4, 4, 0, 0]} />
          <Bar dataKey="c" name="기타" fill={OTHER_COLOR}  radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
