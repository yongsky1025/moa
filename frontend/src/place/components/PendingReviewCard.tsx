import { useState } from "react";
import { MapPin, Clock, PenLine } from "lucide-react";
import type { PendingReviewDTO } from "../types/placeTypes";
import ReviewFormModal from "./ReviewFormModal";
import { createReview } from "../api/placeReviewApi";

interface Props {
  pending: PendingReviewDTO;
  onCreated: () => void;
}

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

function formatTime(iso: string) {
  return iso.slice(11, 16); // "HH:mm"
}

function getDaysLeft(deadlineIso: string): number {
  const now = new Date();
  const deadline = new Date(deadlineIso);
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function PendingReviewCard({ pending, onCreated }: Props) {
  const [showModal, setShowModal] = useState(false);
  const daysLeft = getDaysLeft(pending.reviewDeadline);

  const handleCreate = async (rating: number, comment: string, imagePaths: string[]) => {
    await createReview(pending.reservationId, { rating, comment, imagePaths });
    onCreated();
  };

  return (
    <>
      <div className="rounded-2xl border border-[#5F8F7B]/30 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* 장소명 */}
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#5F8F7B]" />
              <span className="truncate">{pending.placeName}</span>
            </div>

            {/* 이용 날짜/시간 */}
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(pending.startTime)} {formatTime(pending.startTime)} ~{" "}
              {formatTime(pending.endTime)}
            </p>

            {/* 마감까지 남은 일수 */}
            <div className="mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <span
                className={`text-xs font-medium ${
                  daysLeft <= 3 ? "text-red-500" : "text-amber-500"
                }`}
              >
                마감까지 {daysLeft}일 남음
              </span>
              <span className="text-xs text-gray-400">
                ({formatDate(pending.reviewDeadline)} 까지)
              </span>
            </div>
          </div>

          {/* 후기 작성 버튼 */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#5F8F7B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4e7a68]"
          >
            <PenLine className="h-4 w-4" />
            후기 작성
          </button>
        </div>
      </div>

      {showModal && (
        <ReviewFormModal
          mode="create"
          placeName={pending.placeName}
          onSubmit={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
