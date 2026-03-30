import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, MessageSquareText, Inbox } from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import PendingReviewCard from "../components/PendingReviewCard";
import ReviewCard from "../components/ReviewCard";
import { fetchMyReviews, fetchPendingReviews } from "../api/placeReviewApi";
import type { MyPlaceReviewDTO, PendingReviewDTO } from "../types/placeTypes";

type Tab = "pending" | "written";

export default function MyPlaceReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: Tab =
    searchParams.get("tab") === "written" ? "written" : "pending";

  const [pending, setPending] = useState<PendingReviewDTO[]>([]);
  const [myReviews, setMyReviews] = useState<MyPlaceReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingData, myData] = await Promise.all([
        fetchPendingReviews(),
        fetchMyReviews(),
      ]);
      setPending(pendingData);
      setMyReviews(myData);
    } catch {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchTab = (tab: Tab) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
          장소 이용 후기 관리
        </h1>

        <div className="flex gap-6">
          {/* ── 사이드바 ── */}
          <aside className="w-44 shrink-0">
            <nav className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SidebarItem
                icon={<ClipboardList className="h-4 w-4" />}
                label="작성 가능한 후기"
                badge={!loading && pending.length > 0 ? pending.length : undefined}
                active={activeTab === "pending"}
                onClick={() => switchTab("pending")}
              />
              <div className="mx-4 h-px bg-gray-100" />
              <SidebarItem
                icon={<MessageSquareText className="h-4 w-4" />}
                label="내가 쓴 후기"
                badge={!loading && myReviews.length > 0 ? myReviews.length : undefined}
                active={activeTab === "written"}
                onClick={() => switchTab("written")}
              />
            </nav>
          </aside>

          {/* ── 콘텐츠 ── */}
          <main className="min-w-0 flex-1">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#5F8F7B]" />
              </div>
            ) : error ? (
              <p className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </p>
            ) : activeTab === "pending" ? (
              <section>
                <SectionHeader
                  icon={<ClipboardList className="h-5 w-5 text-[#5F8F7B]" />}
                  title="작성 가능한 후기"
                  count={pending.length > 0 ? `${pending.length}건` : undefined}
                />
                {pending.length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="h-8 w-8 text-gray-300" />}
                    message="작성 가능한 후기가 없습니다."
                    sub="이용 완료 후 30일 이내에 후기를 작성할 수 있습니다."
                  />
                ) : (
                  <div className="space-y-3">
                    {pending.map((p) => (
                      <PendingReviewCard
                        key={p.reservationId}
                        pending={p}
                        onCreated={loadData}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section>
                <SectionHeader
                  icon={<MessageSquareText className="h-5 w-5 text-[#5F8F7B]" />}
                  title="내가 쓴 후기"
                  count={myReviews.length > 0 ? `총 ${myReviews.length}건` : undefined}
                />
                {myReviews.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquareText className="h-8 w-8 text-gray-300" />}
                    message="아직 작성한 후기가 없습니다."
                    sub="장소 이용 후 솔직한 후기를 남겨보세요."
                  />
                ) : (
                  <div className="space-y-3">
                    {myReviews.map((r) => (
                      <ReviewCard
                        key={r.reviewId}
                        review={r}
                        onUpdated={loadData}
                        onDeleted={loadData}
                      />
                    ))}
                  </div>
                )}
              </section>
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
          ? "bg-[#EAF4F0] text-[#5F8F7B]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <span className={active ? "text-[#5F8F7B]" : "text-gray-400"}>{icon}</span>
      <span className="flex-1 leading-snug">{label}</span>
      {badge !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-[#5F8F7B] text-white" : "bg-gray-100 text-gray-500"
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
      {count && <span className="text-sm font-normal text-gray-400">{count}</span>}
    </div>
  );
}

function EmptyState({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
      {icon}
      <p className="mt-3 text-sm font-medium text-gray-500">{message}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}
