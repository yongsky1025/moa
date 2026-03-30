import { CalendarClock } from "lucide-react";
import type { PlaceDetailDTO } from "../types/placeTypes";

interface Props {
  place: PlaceDetailDTO;
}

function formatTime(t?: string) {
  if (!t) return "-";
  return t.slice(0, 5); // "HH:mm:ss" → "HH:mm"
}

function formatMinutes(m: number) {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min === 0 ? `${h}시간` : `${h}시간 ${min}분`;
}

export default function PlaceReservationPanel({ place }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      {/* 가격 */}
      <div className="mb-5">
        <span className="text-[26px] font-extrabold text-gray-900">
          {place.pricePerHour.toLocaleString()}원
        </span>
        <span className="ml-1 text-sm text-gray-400">/ 시간</span>
      </div>

      {/* 운영 정보 */}
      <div className="mb-5 flex flex-col gap-2.5 rounded-xl bg-gray-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">운영 시간</span>
          <span className="font-semibold text-gray-900">
            {formatTime(place.openTime)} ~ {formatTime(place.closeTime)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">최소 예약</span>
          <span className="font-semibold text-gray-900">
            {formatMinutes(place.minReservationMinutes)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">최대 예약</span>
          <span className="font-semibold text-gray-900">
            {formatMinutes(place.maxReservationMinutes)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">수용 인원</span>
          <span className="font-semibold text-gray-900">
            최대 {place.capacity}명
          </span>
        </div>
      </div>

      {/* 예약 서비스 준비 중 안내 */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-4">
        <CalendarClock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5F8F7B]" />
        <div>
          <p className="mb-1 text-sm font-semibold text-green-700">
            예약/결제 서비스 준비 중
          </p>
          <p className="text-xs leading-relaxed text-green-900">
            현재 예약·결제 시스템을 준비하고 있습니다. 오픈 시 알림을 받으시려면
            좋아요를 눌러주세요.
          </p>
        </div>
      </div>

      {/* 예약 버튼 (비활성) */}
      <button
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-gray-200 py-3.5 text-sm font-bold text-gray-400"
      >
        예약하기 (준비 중)
      </button>

      <p className="mt-2.5 text-center text-[11px] text-gray-300">
        예약 전 이용 규정을 확인해 주세요
      </p>
    </div>
  );
}
