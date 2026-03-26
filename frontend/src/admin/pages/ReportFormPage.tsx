import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, X, Plus } from "lucide-react";
import type { ReportCategory, ReportTargetType } from "../types/adminTypes";
import { postReport } from "../api/adminReportAndSanctionApi";
import { requestUploadUrl, uploadImageFile } from "../api/adminPlaceApi";

const API_HOST = "http://localhost:8080";
const MAX_IMAGES = 3;

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  SPAM: "스팸",
  OBSCENE: "음란/선정",
  ABUSE: "욕설/비하",
  FRAUD: "사기/허위",
  PRIVACY: "개인정보 침해",
  INAPPROPRIATE: "부적절한 콘텐츠",
  OTHER: "기타",
};

const TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  USER: "사용자",
  POST: "게시글",
  REPLY: "댓글",
  CIRCLE: "모임",
};

export default function ReportFormPage() {
  const [params] = useSearchParams();
  const targetType = (params.get("targetType") ?? "POST") as ReportTargetType;
  const targetId = Number(params.get("targetId") ?? "0");

  const inputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<ReportCategory>("SPAM");
  const [description, setDescription] = useState("");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - imagePaths.length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      setUploadError(
        `최대 ${MAX_IMAGES}장까지 첨부 가능합니다. ${remaining}장만 업로드됩니다.`,
      );
    } else {
      setUploadError("");
    }

    setUploading(true);
    try {
      const newPaths: string[] = [];
      for (const file of toUpload) {
        const { uploadUrl } = await requestUploadUrl(
          file.name,
          file.type || "image/jpeg",
          "REPORT",
        );
        const path = await uploadImageFile(uploadUrl, file);
        newPaths.push(path);
      }
      setImagePaths((prev) => [...prev, ...newPaths]);
    } catch {
      setUploadError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (idx: number) => {
    setImagePaths((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("신고 사유를 입력해주세요.");
      return;
    }
    if (!targetId) {
      setError("신고 대상 정보가 올바르지 않습니다.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await postReport({
        targetType,
        targetId,
        category,
        description: description.trim(),
        imagePaths: imagePaths.length > 0 ? imagePaths : undefined,
      });
      setDone(true);
      setTimeout(() => window.close(), 1500);
    } catch {
      setError("신고 접수에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-moa-accent-light px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E3886D]">
          <ShieldAlert className="h-7 w-7 text-white" />
        </div>
        <p className="text-lg font-bold text-[#C0613A]">신고가 접수되었습니다.</p>
        <p className="text-sm text-orange-400">잠시 후 창이 닫힙니다.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-moa-accent-light">
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b border-orange-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3886D]">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-[#C0613A]">신고하기</h1>
          <p className="text-xs text-orange-400">
            {TARGET_TYPE_LABELS[targetType]} #{targetId}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.close()}
          className="ml-auto cursor-pointer text-orange-300 hover:text-orange-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-6 py-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 신고 카테고리 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#C0613A]">
            신고 유형 <span className="text-red-400">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory)}
            className="w-full cursor-pointer rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-[#E3886D] focus:outline-none"
          >
            {(Object.keys(CATEGORY_LABELS) as ReportCategory[]).map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        {/* 신고 사유 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#C0613A]">
            신고 사유 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="구체적인 신고 사유를 입력해주세요."
            className="w-full resize-none rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm placeholder:text-gray-300 focus:border-[#E3886D] focus:outline-none"
          />
        </div>

        {/* 증거 이미지 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#C0613A]">
            증거 사진{" "}
            <span className="font-normal text-orange-400">
              (선택, 최대 {MAX_IMAGES}장)
            </span>
          </label>

          {uploadError && (
            <p className="mb-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-600">
              {uploadError}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {imagePaths.map((path, idx) => (
              <div
                key={path}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-orange-200"
              >
                <img
                  src={`${API_HOST}${path}`}
                  alt={`첨부 ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {imagePaths.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-orange-200 text-orange-300 transition hover:border-[#E3886D] hover:text-[#E3886D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-[#E3886D]" />
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px]">추가</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 border-t border-orange-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => window.close()}
          className="flex-1 cursor-pointer rounded-xl border border-orange-200 bg-white py-2.5 text-sm font-medium text-orange-400 transition hover:bg-orange-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 cursor-pointer rounded-xl bg-[#E3886D] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C0613A] disabled:opacity-50"
        >
          {submitting ? "접수 중..." : "신고 접수"}
        </button>
      </div>
    </div>
  );
}
