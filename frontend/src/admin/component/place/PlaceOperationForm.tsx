import { Clock, DollarSign, Users } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "월" },
  { value: "TUESDAY", label: "화" },
  { value: "WEDNESDAY", label: "수" },
  { value: "THURSDAY", label: "목" },
  { value: "FRIDAY", label: "금" },
  { value: "SATURDAY", label: "토" },
  { value: "SUNDAY", label: "일" },
];

const RESERVATION_OPTIONS = [30, 60, 90, 120, 180, 240, 300, 360, 480, 600, 720];

function formatMinutes(m: number) {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const remainder = m % 60;
  return remainder ? `${h}시간 ${remainder}분` : `${h}시간`;
}

export interface OperationData {
  openTimeHour: number;
  openTimeMinute: number;
  closeTimeHour: number;
  closeTimeMinute: number;
  capacity: number;
  pricePerHour: number;
  minReservationMinutes: number;
  maxReservationMinutes: number;
  closedDays: string[];
}

interface Props {
  value: OperationData;
  onChange: (data: OperationData) => void;
}

export default function PlaceOperationForm({ value, onChange }: Props) {
  const update = (partial: Partial<OperationData>) => {
    onChange({ ...value, ...partial });
  };

  const toggleClosedDay = (day: string) => {
    const next = value.closedDays.includes(day)
      ? value.closedDays.filter((d) => d !== day)
      : [...value.closedDays, day];
    update({ closedDays: next });
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <Clock className="h-4 w-4" /> 운영 정보
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 오픈 시간 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">오픈 시간</label>
          <div className="flex gap-1">
            <select
              value={value.openTimeHour}
              onChange={(e) => update({ openTimeHour: Number(e.target.value) })}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}시
                </option>
              ))}
            </select>
            <select
              value={value.openTimeMinute}
              onChange={(e) => update({ openTimeMinute: Number(e.target.value) })}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              {[0, 30].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}분
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 마감 시간 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">마감 시간</label>
          <div className="flex gap-1">
            <select
              value={value.closeTimeHour}
              onChange={(e) => update({ closeTimeHour: Number(e.target.value) })}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}시
                </option>
              ))}
            </select>
            <select
              value={value.closeTimeMinute}
              onChange={(e) => update({ closeTimeMinute: Number(e.target.value) })}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              {[0, 30].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}분
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 수용 인원 */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-600">
            <Users className="h-3.5 w-3.5" /> 수용 인원
          </label>
          <input
            type="number"
            value={value.capacity}
            onChange={(e) => update({ capacity: Number(e.target.value) })}
            min={1}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5F8F7B]"
          />
        </div>

        {/* 시간당 가격 */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-600">
            <DollarSign className="h-3.5 w-3.5" /> 시간당 가격 (원)
          </label>
          <input
            type="number"
            value={value.pricePerHour}
            onChange={(e) => update({ pricePerHour: Number(e.target.value) })}
            step={1000}
            min={0}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5F8F7B]"
          />
        </div>

        {/* 최소 예약 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">최소 예약</label>
          <select
            value={value.minReservationMinutes}
            onChange={(e) => update({ minReservationMinutes: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {RESERVATION_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {formatMinutes(m)}
              </option>
            ))}
          </select>
        </div>

        {/* 최대 예약 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">최대 예약</label>
          <select
            value={value.maxReservationMinutes}
            onChange={(e) => update({ maxReservationMinutes: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {RESERVATION_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {formatMinutes(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 정기 휴무일 */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-600">정기 휴무일</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const active = value.closedDays.includes(day.value);
            return (
              <button
                key={day.value}
                onClick={() => toggleClosedDay(day.value)}
                className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
