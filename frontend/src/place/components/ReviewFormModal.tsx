import { useRef, useState } from "react";
import { Star, X, ImagePlus, Trash2 } from "lucide-react";
import { uploadReviewImage } from "../api/placeReviewApi";
import { toAssetUrl } from "../../common/utils/assetUrl";
const MAX_IMAGES = 3;

interface Props {
  mode: "create" | "edit";
  placeName: string;
  initialRating?: number;
  initialComment?: string;
  initialImages?: string[];
  onSubmit: (rating: number, comment: string, imagePaths: string[]) => Promise<void>;
  onClose: () => void;
}

export default function ReviewFormModal({
  mode,
  placeName,
  initialRating = 0,
  initialComment = "",
  initialImages = [],
  onSubmit,
  onClose,
}: Props) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    setError("");
    try {
      const newPaths: string[] = [];
      for (const file of toUpload) {
        const path = await uploadReviewImage(file);
        newPaths.push(path);
      }
      setImages((prev) => [...prev, ...newPaths]);
    } catch {
      setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    if (!comment.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(rating, comment.trim(), images);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-800">
            {mode === "create" ? "후기 작성" : "후기 수정"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 장소명 */}
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{placeName}</span>에 대한 후기를 남겨주세요.
          </p>

          {/* 별점 */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">별점</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="h-8 w-8"
                    style={{
                      fill: s <= (hoverRating || rating) ? "#f59e0b" : "none",
                      color: s <= (hoverRating || rating) ? "#f59e0b" : "#d1d5db",
                    }}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 self-center text-sm font-medium text-amber-500">
                  {["", "별로예요", "아쉬워요", "보통이에요", "좋아요", "최고예요"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* 코멘트 */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">후기 내용</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="장소 이용 경험을 자유롭게 작성해주세요."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#5F8F7B] focus:ring-1 focus:ring-[#5F8F7B]"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/500</p>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              사진 첨부
              <span className="ml-1 font-normal text-gray-400">({images.length}/{MAX_IMAGES}장)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {images.map((path, idx) => (
                <div
                  key={path}
                  className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200"
                >
                  <img
                    src={toAssetUrl(path)}
                    alt={`후기 이미지 ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-[#5F8F7B] hover:text-[#5F8F7B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#5F8F7B]" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px]">사진 추가</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 오류 */}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="flex-1 rounded-xl bg-[#5F8F7B] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4e7a68] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "저장 중..." : mode === "create" ? "후기 등록" : "수정 완료"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>
    </div>
  );
}
