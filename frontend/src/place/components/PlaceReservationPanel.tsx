import { useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/style.css";
import "../styles/placeDayPicker.css";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useAuthStore } from "../../store/authStore";
import type {
  MyUpcomingScheduleDTO,
  OccupiedSlotDTO,
  PlaceClosedDayDTO,
  PlaceDetailDTO,
} from "../types/placeTypes";
import {
  fetchMyUpcomingSchedules,
  fetchOccupiedSlots,
  holdReservation,
} from "../api/reservationApi";
import ReservationTimeGrid from "./ReservationTimeGrid";
import ScheduleConnectSection from "./ScheduleConnectSection";

interface Props {
  place: PlaceDetailDTO;
  initialDate?: string;
  initialScheduleId?: number;
}

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY as string;

function formatMinutes(m: number): string {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min === 0 ? `${h}시간` : `${h}시간 ${min}분`;
}

function formatTime(t?: string): string {
  if (!t) return "-";
  return t.slice(0, 5);
}

function timeToMin(t: string): number {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function isClosedDay(date: string, closedDays: PlaceClosedDayDTO[]): boolean {
  const d = new Date(date + "T00:00:00");
  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const dayName = dayNames[d.getDay()];
  return closedDays.some(
    (cd) =>
      (cd.closedType === "WEEKLY" && cd.dayOfWeek === dayName) ||
      (cd.closedType === "HOLIDAY" && cd.date === date),
  );
}

function calcPrice(start: string, end: string, pricePerHour: number): number {
  const diffMin = timeToMin(end) - timeToMin(start);
  return Math.round((pricePerHour * diffMin) / 60);
}

const today = new Date().toISOString().split("T")[0];

function getNowTime(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function PlaceReservationPanel({ place, initialDate, initialScheduleId }: Props) {
  const { isLoggedIn, userId } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  const [timeOpen, setTimeOpen] = useState(false);

  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlotDTO[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const [mySchedules, setMySchedules] = useState<MyUpcomingScheduleDTO[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );

  const handleScheduleChange = (id: number | null) => {
    setSelectedScheduleId(id);
    if (id !== null) {
      const schedule = mySchedules.find((s) => s.scheduleId === id);
      if (schedule) {
        const dateStr = schedule.startAt.split("T")[0];
        setSelectedDate(dateStr);
        setError(null);
      }
    }
  };

  const [isHolding, setIsHolding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closedToday = isClosedDay(selectedDate, place.closedDays);
  const estimatedPrice =
    startTime && endTime
      ? calcPrice(startTime, endTime, place.pricePerHour)
      : null;
  const durationMin =
    startTime && endTime ? timeToMin(endTime) - timeToMin(startTime) : 0;

  // 달력 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node))
        setCalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 시작+종료 모두 선택되면 시간 드롭다운 자동 닫기
  useEffect(() => {
    if (startTime && endTime) setTimeOpen(false);
  }, [startTime, endTime]);

  // 날짜 변경 시 슬롯 재조회
  useEffect(() => {
    if (!selectedDate || closedToday) {
      setOccupiedSlots([]);
      setStartTime(null);
      setEndTime(null);
      return;
    }
    setSlotsLoading(true);
    fetchOccupiedSlots(place.id, selectedDate)
      .then(setOccupiedSlots)
      .catch(() => setOccupiedSlots([]))
      .finally(() => setSlotsLoading(false));
    setStartTime(null);
    setEndTime(null);
  }, [selectedDate, place.id, closedToday]);

  // 로그인한 경우 내 일정 조회
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchMyUpcomingSchedules()
      .then(setMySchedules)
      .catch(() => {});
  }, [isLoggedIn]);

  // mySchedules 로드 완료 후 initialScheduleId 자동 선택 + 날짜 세팅
  useEffect(() => {
    if (!initialScheduleId || mySchedules.length === 0) return;
    const schedule = mySchedules.find((s) => s.scheduleId === initialScheduleId);
    if (schedule) {
      setSelectedScheduleId(initialScheduleId);
      setSelectedDate(schedule.startAt.split("T")[0]);
    }
  }, [mySchedules, initialScheduleId]);

  const selectedDateObj = selectedDate
    ? new Date(selectedDate + "T00:00:00")
    : undefined;
  const dateLabel = selectedDate
    ? selectedDate.replace(/-/g, ".")
    : "날짜 선택";

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");
    setError(null);
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setCalOpen(false);
  };

  const handleSlotClick = (slot: string) => {
    setError(null);

    // 1. 이미 시작 시간으로 선택된 슬롯을 다시 클릭한 경우 -> 전체 해제
    if (slot === startTime) {
      setStartTime(null);
      setEndTime(null);
      return;
    }

    // 2. 이미 종료 시간으로 선택된 슬롯을 다시 클릭한 경우 -> 종료 시간만 해제
    if (slot === endTime) {
      setEndTime(null);
      return;
    }

    // 3. 시작과 종료가 모두 선택된 상태에서 새로운 슬롯 클릭 시 -> 해당 슬롯을 시작점으로 재설정
    if (startTime && endTime) {
      setStartTime(slot);
      setEndTime(null);
      return;
    }

    // 4. 시작 시간만 있고 종료 시간은 없는 상태에서 로직
    if (!startTime) {
      setStartTime(slot);
    } else {
      const slotMin = timeToMin(slot);
      const startMin = timeToMin(startTime);

      if (slotMin < startMin) {
        // 시작 시간보다 이전 시간을 클릭하면 시작 시간을 변경
        setStartTime(slot);
      } else {
        // 시작 시간 이후를 클릭하면 종료 시간으로 설정
        setEndTime(slot);
      }
    }
  };

  const handleReserve = async () => {
    if (!isLoggedIn) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!startTime || !endTime) {
      setError("시작 시간과 종료 시간을 선택해주세요.");
      return;
    }
    setError(null);
    setIsHolding(true);
    try {
      const startISO = `${selectedDate}T${startTime}:00`;
      const endISO = `${selectedDate}T${endTime}:00`;
      const holdRes = await holdReservation({
        placeId: place.id,
        startTime: startISO,
        endTime: endISO,
        scheduleId: selectedScheduleId,
      });

      sessionStorage.setItem(
        "pendingReservationId",
        String(holdRes.reservationId),
      );

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: `user-${userId}` });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: holdRes.amount },
        orderId: holdRes.orderId,
        orderName: holdRes.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "예약 처리 중 오류가 발생했습니다.";
      setError(msg);
      sessionStorage.removeItem("pendingReservationId");
    } finally {
      setIsHolding(false);
    }
  };

  const canReserve =
    isLoggedIn && startTime && endTime && !isHolding && !closedToday;

  return (
    <div className="rounded-2xl border border-moa-border bg-white p-6 shadow-md">
      {/* 가격 헤더 */}
      <div className="mb-5">
        <span className="text-[26px] font-extrabold text-gray-900">
          {place.pricePerHour.toLocaleString()}원
        </span>
        <span className="ml-1 text-sm text-moa-subtle">/ 시간</span>
      </div>

      {/* 운영 정보 */}
      <div className="mb-5 rounded-xl bg-gray-50 p-3">
        <div className="flex justify-between text-xs">
          <span className="text-moa-subtle">운영 시간</span>
          <span className="font-semibold text-gray-800">
            {formatTime(place.openTime)} ~ {formatTime(place.closeTime)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-moa-subtle">최소/최대 예약</span>
          <span className="font-semibold text-gray-800">
            {formatMinutes(place.minReservationMinutes)} ~{" "}
            {formatMinutes(place.maxReservationMinutes)}
          </span>
        </div>
      </div>

      {/* 날짜 선택 */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          날짜 선택
        </label>
        <div ref={calRef} className="relative">
          <button
            type="button"
            onClick={() => setCalOpen((v) => !v)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
              selectedDate
                ? "border-moa-primary bg-moa-light text-moa-secondary"
                : "border-moa-border bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {dateLabel}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${calOpen ? "rotate-180" : ""}`}
            />
          </button>
          {calOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-30 rounded-xl border border-gray-200 bg-white shadow-lg">
              <DayPicker
                mode="single"
                selected={selectedDateObj}
                onSelect={handleDaySelect}
                disabled={[{ before: new Date() }]}
                locale={ko}
                modifiers={{
                  saturday: { dayOfWeek: [6] },
                  sunday: { dayOfWeek: [0] },
                }}
                modifiersClassNames={{
                  saturday: "rdp-day--saturday",
                  sunday: "rdp-day--sunday",
                }}
                classNames={{
                  root: "moa-rdp",
                  today: "rdp-today",
                  selected: "rdp-selected",
                }}
              />
            </div>
          )}
        </div>
        {closedToday && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            휴무일입니다. 다른 날짜를 선택해주세요.
          </p>
        )}
      </div>

      {/* 시간 선택 */}
      {selectedDate && !closedToday && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            시간 선택
          </label>
          {slotsLoading ? (
            <div className="flex h-20 items-center justify-center text-xs text-moa-subtle">
              시간대 조회 중...
            </div>
          ) : (
            <>
              {/* 드롭다운 토글 버튼 */}
              <button
                type="button"
                onClick={() => setTimeOpen((v) => !v)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  startTime
                    ? "border-moa-primary bg-moa-light text-moa-secondary"
                    : "border-moa-border bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span>
                  {startTime && endTime
                    ? `${startTime} ~ ${endTime}`
                    : startTime
                      ? `${startTime} ~ 종료 시간 선택`
                      : "시간 선택"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${timeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* 슬롯 그리드 (드롭다운) */}
              {timeOpen && (
                <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <ReservationTimeGrid
                    openTime={place.openTime}
                    closeTime={place.closeTime}
                    minMinutes={place.minReservationMinutes}
                    maxMinutes={place.maxReservationMinutes}
                    occupiedSlots={occupiedSlots}
                    startTime={startTime}
                    endTime={endTime}
                    onSlotClick={handleSlotClick}
                    isToday={selectedDate === today}
                    nowTime={getNowTime()}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 선택된 시간 요약 */}
      {startTime && endTime && estimatedPrice !== null && (
        <div className="mb-4 rounded-xl bg-moa-light p-3">
          <div className="flex justify-between text-xs">
            <span className="text-moa-subtle">예약 시간</span>
            <span className="font-semibold text-moa-secondary">
              {startTime} ~ {endTime} ({formatMinutes(durationMin)})
            </span>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-xs text-moa-subtle">예상 금액</span>
            <span className="text-base font-extrabold text-moa-primary">
              {estimatedPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {/* 일정 연결 (서클장 + 일정 있을 때만 노출) */}
      {mySchedules.length > 0 && (
        <div className="mb-4">
          <ScheduleConnectSection
            schedules={mySchedules}
            selectedId={selectedScheduleId}
            onChange={handleScheduleChange}
          />
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* 환불 안내 */}
      <p className="mb-4 text-[11px] leading-relaxed text-moa-subtle">
        이용 시작 24시간 전까지 100% 환불 · 이후 환불 불가
      </p>

      {/* 예약 버튼 */}
      <button
        type="button"
        onClick={handleReserve}
        disabled={!canReserve}
        className={`w-full rounded-xl py-3.5 text-sm font-bold transition-colors ${
          canReserve
            ? "bg-moa-primary text-white hover:bg-moa-hover"
            : "cursor-not-allowed bg-gray-200 text-gray-400"
        }`}
      >
        {isHolding
          ? "처리 중..."
          : !isLoggedIn
            ? "로그인 후 예약 가능"
            : "예약하기"}
      </button>
    </div>
  );
}
