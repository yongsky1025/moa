import type { ReservationCountDTO } from "../../types/adminTypes";

interface Props {
  data: ReservationCountDTO | null;
  loading: boolean;
}

function ChangeRate({ rate }: { rate: number }) {
  const isUp = rate > 0;
  const isFlat = rate === 0;
  const color = isFlat ? "#9CA3AF" : isUp ? "#10B981" : "#F43F5E";
  const arrow = isFlat ? "–" : isUp ? "▲" : "▼";
  return (
    <span
      className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold"
      style={{ color }}
    >
      {arrow} {Math.abs(rate).toFixed(1)}%
    </span>
  );
}

export default function PlaceReservationCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="admin-card flex h-full flex-col gap-4">
        <div className="skeleton h-4 w-2/3" />
        <div className="flex flex-1 gap-3">
          <div
            className="skeleton flex-1 rounded-xl"
            style={{ minHeight: 90 }}
          />
          <div
            className="skeleton flex-1 rounded-xl"
            style={{ minHeight: 90 }}
          />
        </div>
      </div>
    );
  }

  const items = [
    {
      label: "오늘 예약",
      value: data.todayCount,
      prev: data.yesterdayCount,
      rate: data.todayChangeRate,
      sub: `어제 ${data.yesterdayCount}건`,
      accent: "#5F8F7B",
      bg: "#EAF4F0",
    },
    {
      label: "이번주 예약",
      value: data.weekCount,
      prev: data.lastWeekCount,
      rate: data.weekChangeRate,
      sub: `지난주 ${data.lastWeekCount}건`,
      accent: "#14B8A6",
      bg: "#F0FDFA",
    },
  ];

  return (
    <div className="admin-card flex h-full flex-col">
      <h3 className="admin-card-title">장소 예약 현황</h3>
      <div className="flex flex-1 flex-col gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col justify-center rounded-xl border border-gray-100 px-4 py-3"
            style={{ background: item.bg }}
          >
            <p className="mb-0.5 text-[11px] text-moa-subtle">{item.label}</p>
            <p
              className="text-2xl font-black leading-tight tracking-tight"
              style={{ color: item.accent }}
            >
              {item.value.toLocaleString("ko-KR")}
              <span className="ml-1 text-sm font-semibold">건</span>
            </p>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-[11px] text-moa-subtle">{item.sub}</span>
              <ChangeRate rate={item.rate} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
