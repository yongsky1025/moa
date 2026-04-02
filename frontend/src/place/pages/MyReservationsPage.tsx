import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Loader2,
  ClipboardList,
  CheckCircle2,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import AdminResultModal from "../../admin/component/AdminResultModal";
import { cancelReservation, fetchMyReservations } from "../api/reservationApi";
import type { MyReservationDTO } from "../types/placeTypes";

type Tab = "all" | "upcoming" | "past";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  HOLDING: { label: "선점 중", className: "bg-yellow-100 text-yellow-700" },
  RESERVED: { label: "예약 완료", className: "bg-green-100 text-green-700" },
  COMPLETED: { label: "이용 완료", className: "bg-gray-100 text-gray-500" },
  CANCELLED: { label: "취소됨", className: "bg-red-100 text-red-500" },
  EXPIRED: { label: "만료됨", className: "bg-gray-100 text-gray-400" },
};

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterByTab(reservations: MyReservationDTO[], tab: Tab) {
  if (tab === "upcoming")
    return reservations.filter((r) =>
      ["HOLDING", "RESERVED"].includes(r.status),
    );
  if (tab === "past")
    return reservations.filter((r) =>
      ["COMPLETED", "CANCELLED", "EXPIRED"].includes(r.status),
    );
  return reservations;
}

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: Tab =
    searchParams.get("tab") === "upcoming"
      ? "upcoming"
      : searchParams.get("tab") === "past"
        ? "past"
        : "all";

  const [reservations, setReservations] = useState<MyReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 취소 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyReservations()
      .then(setReservations)
      .catch(() => setError("예약 목록을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const switchTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  const handleCancelClick = (reservationId: number) => {
    setCancelTargetId(reservationId);
    setPolicyChecked(false);
    setPolicyError(false);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    if (!policyChecked) {
      setPolicyError(true);
      return;
    }
    setConfirmOpen(false);
    setCancelling(true);
    try {
      await cancelReservation(cancelTargetId, "사용자 취소");
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === cancelTargetId
            ? { ...r, status: "CANCELLED" }
            : r,
        ),
      );
      setResultMsg("예약이 취소되었습니다.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "취소 처리 중 오류가 발생했습니다.";
      setResultMsg(msg);
    } finally {
      setCancelling(false);
      setCancelTargetId(null);
      setResultOpen(true);
    }
  };

  const displayed = filterByTab(reservations, activeTab);
  const upcomingCount = reservations.filter((r) =>
    ["HOLDING", "RESERVED"].includes(r.status),
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <button
          onClick={() => navigate('/users/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', marginBottom: 6, padding: 0 }}
        >
          ← 마이페이지로 돌아가기
        </button>
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
          내 예약 목록
        </h1>

        <div className="flex gap-6">
          {/* ── 사이드바 ── */}
          <aside className="w-44 shrink-0">
            <nav className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SidebarItem
                icon={<ClipboardList className="h-4 w-4" />}
                label="전체 예약"
                badge={
                  !loading && reservations.length > 0
                    ? reservations.length
                    : undefined
                }
                active={activeTab === "all"}
                onClick={() => switchTab("all")}
              />
              <div className="mx-4 h-px bg-gray-100" />
              <SidebarItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="예정된 예약"
                badge={
                  !loading && upcomingCount > 0 ? upcomingCount : undefined
                }
                active={activeTab === "upcoming"}
                onClick={() => switchTab("upcoming")}
              />
              <div className="mx-4 h-px bg-gray-100" />
              <SidebarItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="지난 예약"
                active={activeTab === "past"}
                onClick={() => switchTab("past")}
              />
            </nav>
          </aside>

          {/* ── 콘텐츠 ── */}
          <main className="min-w-0 flex-1">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-moa-primary" />
              </div>
            ) : error ? (
              <p className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </p>
            ) : displayed.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-8 w-8 text-gray-300" />}
                message="예약 내역이 없습니다."
                sub="장소를 대여하고 예약 내역을 확인해보세요."
                onAction={() => navigate("/place/rental")}
                actionLabel="장소 둘러보기"
              />
            ) : (
              <div className="space-y-3">
                <SectionHeader
                  icon={<ClipboardList className="h-5 w-5 text-moa-primary" />}
                  title={
                    activeTab === "all"
                      ? "전체 예약"
                      : activeTab === "upcoming"
                        ? "예정된 예약"
                        : "지난 예약"
                  }
                  count={`${displayed.length}건`}
                />
                {displayed.map((r) => {
                  const statusInfo = STATUS_LABEL[r.status] ?? {
                    label: r.status,
                    className: "bg-gray-100 text-gray-500",
                  };
                  const canCancel = r.status === "RESERVED";
                  return (
                    <div
                      key={r.reservationId}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moa-primary" />
                          <button
                            type="button"
                            onClick={() => navigate(`/place/${r.placeId}`)}
                            className="text-base font-bold text-moa-text hover:underline"
                          >
                            {r.placeName}
                          </button>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {formatDatetime(r.startTime)} ~{" "}
                            {formatTimeOnly(r.endTime)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            결제 금액
                          </span>
                          <span className="font-bold text-moa-primary">
                            {r.totalPrice.toLocaleString()}원
                          </span>
                        </div>
                      </div>

                      {canCancel && (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleCancelClick(r.reservationId)}
                            disabled={cancelling}
                            className="rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            예약 취소
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {/* 취소 확인 모달 */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setConfirmOpen(false);
            setCancelTargetId(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-moa-text">예약 취소</h3>
            <p className="mt-3 text-sm leading-relaxed text-moa-subtle">
              예약을 취소하시겠습니까?
              <br />
              이용 시작 24시간 이내에는 환불이 불가하며, 취소 후에는 복구가
              불가능합니다.
              <br />
              환불 금액은 결제하신 수단으로 반환되며, 처리까지 영업일 기준 3~5일
              소요될 수 있습니다.
            </p>

            {/* 환불 정책 동의 체크박스 */}
            <label className="mt-4 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={policyChecked}
                onChange={(e) => {
                  setPolicyChecked(e.target.checked);
                  if (e.target.checked) setPolicyError(false);
                }}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                환불 불가 정책을 확인했습니다
              </span>
            </label>
            {policyError && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                환불 불가 정책에 동의해주세요.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setCancelTargetId(null);
                }}
                className="cursor-pointer rounded-lg border border-moa-border px-4 py-2 text-sm font-medium text-moa-subtle transition-colors hover:bg-moa-light"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
              >
                예약 취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과 모달 */}
      <AdminResultModal
        open={resultOpen}
        message={resultMsg}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-moa-light text-moa-primary"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <span className={active ? "text-moa-primary" : "text-gray-400"}>
        {icon}
      </span>
      <span className="flex-1 leading-snug">{label}</span>
      {badge !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-moa-primary text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      {count && (
        <span className="text-sm font-normal text-gray-400">{count}</span>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  message,
  sub,
  onAction,
  actionLabel,
}: {
  icon: React.ReactNode;
  message: string;
  sub: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
      {icon}
      <p className="mt-3 text-sm font-medium text-gray-500">{message}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-moa-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-moa-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
