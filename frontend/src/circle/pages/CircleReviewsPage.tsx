import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ChevronLeft, Star, X } from "lucide-react";
import DOMPurify from "dompurify";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { circleApi } from "../../api/circleApi";
import { scheduleApi } from "../../api/scheduleApi";
import type { ScheduleReview } from "../../schedule/types/schedule";
import type { CircleResponse } from "../types/circle";

const PAGE_SIZE = 20;

function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(rating)}
      <span style={{ color: "#e5e7eb" }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ReviewDetailModal({ review, circleId, onClose }: { review: ScheduleReview; circleId: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Link
              to={`/circle/${circleId}/schedules/${review.scheduleId}`}
              style={{ fontSize: 13, fontWeight: 700, color: "#5F8F7B", textDecoration: "none" }}
            >
              {review.scheduleTitle}
            </Link>
            <RatingStars rating={review.rating} size={16} />
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 */}
        <div
          style={{ padding: "20px", fontSize: 14, color: "#333", lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.content) }}
        />

        {/* 작성자 + 날짜 */}
        <div style={{ padding: "12px 20px 20px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #f5f5f5" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>
            {review.nickname.charAt(0)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{review.nickname}</span>
          <span style={{ fontSize: 12, color: "#bbb" }}>· {new Date(review.createdAt).toLocaleDateString("ko-KR")}</span>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, onClick }: { review: ScheduleReview; onClick: () => void }) {
  const imgMatch = review.content.match(/<img[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/i);
  const thumbSrc = imgMatch ? imgMatch[1] : null;
  const plainText = review.content.replace(/<[^>]+>/g, "").trim();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid #f0f0f0",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)")}
    >
      {/* 일정 제목 + 별점 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#5F8F7B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {review.scheduleTitle}
        </span>
        <RatingStars rating={review.rating} size={11} />
      </div>

      {/* 본문 + 썸네일 */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.55, flex: 1, minWidth: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          {plainText || "（이미지 후기）"}
        </p>
        {thumbSrc && (
          <img src={thumbSrc} alt="" style={{ width: 44, height: 44, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
        )}
      </div>

      {/* 작성자 + 날짜 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>
          {review.nickname.charAt(0)}
        </div>
        <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>{review.nickname}</span>
        <span style={{ fontSize: 10, color: "#ccc" }}>· {new Date(review.createdAt).toLocaleDateString("ko-KR")}</span>
      </div>
    </div>
  );
}

export default function CircleReviewsPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [reviews, setReviews] = useState<ScheduleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState<ScheduleReview | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) navigate(`/circle/${cid}`, { replace: true });
  }, [isLoggedIn, cid, navigate]);

  const fetchReviews = useCallback(
    async (pageNum: number, append: boolean) => {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await scheduleApi.getCircleReviews(cid, { page: pageNum, size: PAGE_SIZE });
        const data = res.data;
        setReviews((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);
        setPage(pageNum);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cid]
  );

  useEffect(() => {
    circleApi.getCircle(cid).then((res) => setCircle(res.data)).catch(() => {});
    fetchReviews(0, false);
  }, [cid, fetchReviews]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) fetchReviews(page + 1, true);
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 60px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => navigate(`/circle/${cid}`)}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 14, padding: 0 }}
          >
            <ChevronLeft size={18} />
            서클로 돌아가기
          </button>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>모임 후기</h1>
              {circle && <p style={{ fontSize: 13, color: "#888", marginTop: 4, marginBottom: 0 }}>{circle.title}</p>}
            </div>
            {avgRating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 16px" }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 22, fontWeight: 800, color: "#92400e" }}>{avgRating}</span>
                <span style={{ fontSize: 12, color: "#b45309" }}>/ 5.0</span>
                <span style={{ fontSize: 12, color: "#b45309", marginLeft: 2 }}>({reviews.length}개)</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "48px 0", color: "#aaa" }}>불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: 16, padding: "48px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#bbb", fontSize: 15 }}>아직 작성된 후기가 없습니다.</p>
            <p style={{ color: "#d1d5db", fontSize: 13, marginTop: 6 }}>완료된 일정에 참여한 후 후기를 남겨보세요.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {reviews.map((r) => (
                <ReviewCard key={r.reviewId} review={r} onClick={() => setSelectedReview(r)} />
              ))}
            </div>

            <div ref={sentinelRef} style={{ height: 1 }} />
            {loadingMore && <p style={{ textAlign: "center", padding: "16px 0", color: "#aaa", fontSize: 13 }}>불러오는 중...</p>}
            {!hasMore && reviews.length > 0 && (
              <p style={{ textAlign: "center", padding: "16px 0", color: "#d1d5db", fontSize: 12 }}>모든 후기를 확인했습니다.</p>
            )}
          </>
        )}
      </div>
      <Footer />

      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          circleId={cid}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}
