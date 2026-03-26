import { useEffect, useState } from "react";
import { CalendarOff, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ClosedDayDTO } from "../../types/adminTypes";
import {
  fetchClosedDays,
  addClosedDay,
  removeClosedDay,
} from "../../api/adminPlaceApi";
import AdminConfirmModal from "../AdminConfirmModal";
import AdminResultModal from "../AdminResultModal";

interface Props {
  placeId: number;
}

const WEEK_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // 6행 맞추기
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function PlaceClosedDayManager({ placeId }: Props) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [days, setDays] = useState<ClosedDayDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 캘린더 상태
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<ClosedDayDTO | null>(null);
  const [resultMsg, setResultMsg] = useState("");

  const load = async () => {
    try {
      setDays(await fetchClosedDays(placeId));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [placeId]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const toDateStr = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${viewYear}-${mm}-${dd}`;
  };

  const isPast = (day: number) => toDateStr(day) < todayStr;
  const isHoliday = (day: number) =>
    days.some((d) => d.date === toDateStr(day));
  const isSelected = (day: number) => selectedDate === toDateStr(day);

  const handleDayClick = (day: number) => {
    if (isPast(day)) return;
    const dateStr = toDateStr(day);
    if (isHoliday(day)) {
      // 이미 등록된 날은 삭제 대상으로
      const target = days.find((d) => d.date === dateStr);
      if (target) setDeleteTarget(target);
      return;
    }
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  };

  const handleAdd = async () => {
    if (!selectedDate || !reason.trim()) return;
    setSubmitting(true);
    try {
      const created = await addClosedDay(placeId, selectedDate, reason.trim());
      setDays((prev) =>
        [...prev, created].sort((a, b) =>
          (a.date ?? "").localeCompare(b.date ?? ""),
        ),
      );
      setSelectedDate(null);
      setReason("");
      setResultMsg("휴무일이 추가되었습니다.");
    } catch (e: any) {
      setResultMsg(e.response?.data?.message || "휴무일 추가에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      await removeClosedDay(placeId, deleteTarget.id);
      setDays((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      setResultMsg("휴무일이 삭제되었습니다.");
    } catch {
      setDeleteTarget(null);
      setResultMsg("휴무일 삭제에 실패했습니다.");
    }
  };

  const cells = buildCalendar(viewYear, viewMonth);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <CalendarOff className="h-4 w-4" /> 특정 휴무일 추가
      </h2>

      {/* 캘린더 */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        {/* 월 네비게이션 */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-gray-800">
            {viewYear}년 {viewMonth + 1}월
          </span>
          <button
            onClick={nextMonth}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEK_HEADERS.map((h, i) => (
            <div
              key={h}
              className={`py-1 text-xs font-semibold ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                    ? "text-blue-400"
                    : "text-gray-400"
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const past = isPast(day);
            const holiday = isHoliday(day);
            const selected = isSelected(day);
            const isSunday = idx % 7 === 0;
            const isSaturday = idx % 7 === 6;

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                disabled={past}
                className={[
                  "mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition",
                  past
                    ? "cursor-not-allowed text-gray-300"
                    : holiday
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : selected
                        ? "bg-[#5F8F7B] text-white"
                        : isSunday
                          ? "text-red-400 hover:bg-red-50"
                          : isSaturday
                            ? "text-blue-400 hover:bg-blue-50"
                            : "text-gray-700 hover:bg-white hover:shadow-sm",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />{" "}
            휴무
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#5F8F7B]" />{" "}
            선택
          </span>
        </div>
      </div>

      {/* 선택된 날짜 → 사유 입력 */}
      {selectedDate && (
        <div className="mt-3 flex items-center gap-2">
          <span className="shrink-0 rounded-lg border border-[#5F8F7B]/30 bg-[#5F8F7B]/10 px-3 py-1.5 text-sm font-semibold text-[#5F8F7B]">
            {selectedDate}
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="휴무 사유 입력 (예: 시설 점검)"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#5F8F7B]"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={submitting || !reason.trim()}
            className="shrink-0 cursor-pointer rounded-lg bg-[#5F8F7B] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#4E7C69] disabled:cursor-not-allowed disabled:opacity-50"
          >
            추가
          </button>
          <button
            onClick={() => {
              setSelectedDate(null);
              setReason("");
            }}
            className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      )}

      {/* 등록된 휴무일 목록 */}
      <div className="mt-4">
        {loading ? (
          <div className="py-4 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : days.filter((d) => d.closedType === "HOLIDAY").length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
            등록된 특정 휴무일이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {days
              .filter((d) => d.closedType === "HOLIDAY")
              .map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {d.date}
                    </span>
                    <span className="text-sm text-gray-700">{d.reason}</span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    title="삭제"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <AdminConfirmModal
        open={!!deleteTarget}
        title="휴무일 삭제"
        message={`${deleteTarget?.date} 휴무일을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <AdminResultModal
        open={!!resultMsg}
        message={resultMsg}
        onClose={() => setResultMsg("")}
      />
    </section>
  );
}
