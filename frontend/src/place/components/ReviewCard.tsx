import { useState } from "react";
import { Star, Pencil, Trash2, MapPin, Calendar } from "lucide-react";
import type { MyPlaceReviewDTO } from "../types/placeTypes";
import ReviewFormModal from "./ReviewFormModal";
import { updateReview, deleteReview } from "../api/placeReviewApi";

const API_HOST = "http://localhost:8080";

interface Props {
  review: MyPlaceReviewDTO;
  onUpdated: () => void;
  onDeleted: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="h-3.5 w-3.5"
          style={{
            fill: s <= rating ? "#f59e0b" : "none",
            color: s <= rating ? "#f59e0b" : "#d1d5db",
          }}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  return iso.slice(0, 10).replace(/-/g, ".");
}

export default function ReviewCard({ review, onUpdated, onDeleted }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (rating: number, comment: string, imagePaths: string[]) => {
    await updateReview(review.reviewId, { rating, comment, imagePaths });
    onUpdated();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(review.reviewId);
      onDeleted();
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        {/* 장소명 + 날짜 */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <MapPin className="h-3.5 w-3.5 text-[#5F8F7B]" />
              {review.placeName}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              이용일: {formatDate(review.reservationStartTime)}
            </div>
          </div>
          {/* 수정/삭제 */}
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-[#5F8F7B] hover:text-[#5F8F7B]"
              title="수정"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-400 hover:text-red-500"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 별점 + 작성일 */}
        <div className="mb-2 flex items-center gap-2">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
        </div>

        {/* 코멘트 */}
        <p className="mb-3 text-sm leading-relaxed text-gray-700">{review.comment}</p>

        {/* 이미지 */}
        {review.images.length > 0 && (
          <div className="flex gap-2">
            {review.images.map((path, idx) => (
              <img
                key={path}
                src={`${API_HOST}${path}`}
                alt={`후기 이미지 ${idx + 1}`}
                className="h-16 w-16 rounded-xl object-cover border border-gray-100"
              />
            ))}
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <ReviewFormModal
          mode="edit"
          placeName={review.placeName}
          initialRating={review.rating}
          initialComment={review.comment}
          initialImages={review.images}
          onSubmit={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-bold text-gray-800">후기를 삭제하시겠습니까?</h3>
            <p className="mb-6 text-sm text-gray-500">삭제한 후기는 복구할 수 없습니다.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
