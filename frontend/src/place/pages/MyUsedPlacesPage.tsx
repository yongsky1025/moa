import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Loader2,
  History,
  Inbox,
  Users,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { fetchMyUsedPlaces } from "../api/placeRentalApi";
import type { MyUsedPlaceDTO } from "../types/placeTypes";

type Filter = "all" | "DIRECT" | "SCHEDULE";

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  DIRECT: {
    label: "직접 예약",
    className: "bg-moa-light text-moa-primary border border-moa-muted",
  },
  SCHEDULE: {
    label: "일정 참여",
    className: "bg-orange-50 text-orange-500 border border-orange-200",
  },
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

export default function MyUsedPlacesPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<MyUsedPlaceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetchMyUsedPlaces()
      .then(setPlaces)
      .catch(() => setError("이용한 장소 목록을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const displayed =
    filter === "all" ? places : places.filter((p) => p.sourceType === filter);

  const directCount = places.filter((p) => p.sourceType === "DIRECT").length;
  const scheduleCount = places.filter((p) => p.sourceType === "SCHEDULE").length;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <button
          onClick={() => navigate("/users/profile")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#888",
            marginBottom: 6,
            padding: 0,
          }}
        >
          ← 마이페이지로 돌아가기
        </button>
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
          이용한 장소
        </h1>

        <div className="flex gap-6">
          {/* 사이드바 */}
          <aside className="w-44 shrink-0">
            <nav className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SidebarItem
                icon={<History className="h-4 w-4" />}
                label="전체"
                badge={!loading && places.length > 0 ? places.length : undefined}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <div className="mx-4 h-px bg-gray-100" />
              <SidebarItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="직접 예약"
                badge={!loading && directCount > 0 ? directCount : undefined}
                active={filter === "DIRECT"}
                onClick={() => setFilter("DIRECT")}
              />
              <div className="mx-4 h-px bg-gray-100" />
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="일정 참여"
                badge={!loading && scheduleCount > 0 ? scheduleCount : undefined}
                active={filter === "SCHEDULE"}
                onClick={() => setFilter("SCHEDULE")}
              />
            </nav>
          </aside>

          {/* 콘텐츠 */}
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
                message="이용한 장소가 없습니다."
                sub="장소를 대여하거나 일정에 참여해보세요."
                onAction={() => navigate("/place/rental")}
                actionLabel="장소 둘러보기"
              />
            ) : (
              <div className="space-y-3">
                <div className="mb-4 flex items-center gap-2">
                  <History className="h-5 w-5 text-moa-primary" />
                  <h2 className="text-lg font-bold text-gray-800">
                    {filter === "all"
                      ? "전체 이용 내역"
                      : filter === "DIRECT"
                        ? "직접 예약 이용"
                        : "일정 참여 이용"}
                  </h2>
                  <span className="text-sm font-normal text-gray-400">
                    {displayed.length}건
                  </span>
                </div>

                {displayed.map((r) => {
                  const badge = SOURCE_BADGE[r.sourceType];
                  return (
                    <div
                      key={`${r.sourceType}-${r.reservationId}`}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      {/* 이미지 + 텍스트 행 */}
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/place/${r.placeId}`)}
                          className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                        >
                          {r.thumbnailUrl ? (
                            <img
                              src={r.thumbnailUrl}
                              alt={r.placeName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <MapPin className="h-7 w-7 text-gray-300" />
                            </div>
                          )}
                        </button>

                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/place/${r.placeId}`)}
                              className="text-left text-base font-bold text-moa-text hover:underline"
                            >
                              {r.placeName}
                            </button>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span>
                              {formatDatetime(r.startTime)} ~{" "}
                              {formatTimeOnly(r.endTime)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">결제 금액</span>
                            <span className="font-bold text-moa-primary">
                              {r.totalPrice.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 후기 작성 버튼 — 별도 행 */}
                      {!r.hasReview && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => navigate("/place/my-reviews?tab=pending")}
                            className="rounded-xl border border-moa-primary px-4 py-1.5 text-xs font-semibold text-moa-primary transition hover:bg-moa-light"
                          >
                            후기 작성
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
