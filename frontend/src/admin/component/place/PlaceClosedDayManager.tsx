import { useEffect, useState } from "react";
import { CalendarOff, Plus, X } from "lucide-react";
import type { ClosedDayDTO } from "../../types/adminTypes";
import { fetchClosedDays, addClosedDay, removeClosedDay } from "../../api/adminPlaceApi";
import AdminConfirmModal from "../AdminConfirmModal";
import AdminResultModal from "../AdminResultModal";

interface Props {
  placeId: number;
}

export default function PlaceClosedDayManager({ placeId }: Props) {
  const [days, setDays] = useState<ClosedDayDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 입력 상태
  const [date, setDate] = useState("");
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

  const handleAdd = async () => {
    if (!date) return;
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      const created = await addClosedDay(placeId, date, reason.trim());
      setDays((prev) => [...prev, created].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")));
      setDate("");
      setReason("");
      setResultMsg("휴무일이 추가되었습니다.");
    } catch (e: any) {
      const msg = e.response?.data?.message || "휴무일 추가에 실패했습니다.";
      setResultMsg(msg);
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

  // 오늘 이전 날짜는 선택 불가
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <CalendarOff className="h-4 w-4" /> 특정 휴무일 관리
      </h2>

      {/* 입력 폼 */}
      <div className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-600">날짜</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5F8F7B]"
          />
        </div>
        <div className="flex-[2]">
          <label className="mb-1 block text-sm font-medium text-gray-600">사유</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="예: 인테리어 공사, 시설 점검"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5F8F7B]"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting || !date || !reason.trim()}
          className="flex h-[38px] cursor-pointer items-center gap-1 rounded-lg bg-[#5F8F7B] px-4 text-sm font-medium text-white transition hover:bg-[#4E7C69] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> 추가
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="py-6 text-center text-sm text-gray-400">불러오는 중...</div>
      ) : days.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
          등록된 특정 휴무일이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((d) => (
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

      {/* 삭제 확인 모달 */}
      <AdminConfirmModal
        open={!!deleteTarget}
        title="휴무일 삭제"
        message={`${deleteTarget?.date} 휴무일을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 결과 모달 */}
      <AdminResultModal
        open={!!resultMsg}
        message={resultMsg}
        onClose={() => setResultMsg("")}
      />
    </section>
  );
}
