import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AgeGroupStatsDTO } from "../../types/adminTypes";

interface Props {
  data: AgeGroupStatsDTO[];
  loading: boolean;
}

const MALE_COLOR = "#5B8CCC";
const FEMALE_COLOR = "#E07E9C";
const OTHER_COLOR = "#6B7280";

export default function AgeDistributionCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="admin-card h-full">
        <div className="skeleton mb-4 h-4 w-1/3" />
        <div className="skeleton h-52 w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.ageGroup,
    a: d.countMale,
    b: d.countFemale,
    c: d.countOther,
  }));

  return (
    <div className="admin-card h-full">
      <p className="admin-card-title">연령대별 가입자 수</p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          barCategoryGap="30%"
          barGap={3}
          className="mt-13"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #E5E7EB",
              borderRadius: "0.75rem",
              fontSize: 12,
              color: "#262626",
            }}
            cursor={{ fill: "#EAF4F0" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "#6B7280", paddingTop: 8 }}
          />
          <Bar
            dataKey="a"
            name="남성"
            fill={MALE_COLOR}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="b"
            name="여성"
            fill={FEMALE_COLOR}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="c"
            name="기타"
            fill={OTHER_COLOR}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
