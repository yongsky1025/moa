import { useState } from "react";
import type { SanctionType } from "../../types/adminTypes";

const SANCTION_TYPE_OPTIONS: { value: SanctionType; label: string }[] = [
  { value: "WARNING", label: "경고" },
  { value: "BAN_1D", label: "1일 정지" },
  { value: "BAN_3D", label: "3일 정지" },
  { value: "BAN_30D", label: "30일 정지" },
  { value: "PERMANENT_BAN", label: "영구 정지" },
];

interface AdminSanctionModalProps {
  targetType: "POST" | "REPLY" | "CHAT" | "CIRCLE" | "PLACE_REVIEW" | "USER";
  targetId: number;
  authorName: string;
  onConfirm: (
    reason: string,
    addUserSanction: boolean,
    userSanctionType?: SanctionType,
    userSanctionReason?: string,
  ) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function AdminSanctionModal({
  targetType,
  targetId,
  authorName,
  onConfirm,
  onClose,
  loading,
}: AdminSanctionModalProps) {
  const [reason, setReason] = useState("");
  const [addUserSanction, setAddUserSanction] = useState(false);
  const [userSanctionType, setUserSanctionType] =
    useState<SanctionType>("WARNING");
  const [userSanctionReason, setUserSanctionReason] = useState("");

  const labelMap: Record<string, string> = {
    POST: "게시글", REPLY: "댓글", CHAT: "채팅 메세지",
    CIRCLE: "모임", PLACE_REVIEW: "장소 후기", USER: "유저",
  };
  const label = labelMap[targetType] ?? targetType;
  const isUserType = targetType === "USER";

  const canSubmit = isUserType
    ? userSanctionReason.trim() !== ""
    : reason.trim() !== "" && (!addUserSanction || userSanctionReason.trim() !== "");

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isUserType) {
      // USER 타입: userSanctionType + userSanctionReason를 주 제재로 전달
      onConfirm(userSanctionReason.trim(), true, userSanctionType, userSanctionReason.trim());
    } else {
      onConfirm(
        reason.trim(),
        addUserSanction,
        addUserSanction ? userSanctionType : undefined,
        addUserSanction ? userSanctionReason.trim() : undefined,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="border-moa-border flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <span className="text-sm">🛡</span>
            </div>
            <h2 className="text-moa-text text-base font-bold">
              {isUserType ? `유저 제재 (${authorName})` : `직권 ${label} 삭제`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-moa-subtle hover:text-moa-text cursor-pointer text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* 대상 정보 */}
          <div className="bg-moa-light rounded-xl p-4">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-moa-subtle">대상:</span>{" "}
                <span className="text-moa-text font-semibold">
                  {label} #{targetId}
                </span>
              </div>
              <div>
                <span className="text-moa-subtle">{isUserType ? "대상 유저:" : "작성자:"}</span>{" "}
                <span className="text-moa-text font-semibold">
                  {authorName}
                </span>
              </div>
            </div>
            <p className="text-moa-subtle mt-2 text-xs">
              {isUserType ? "유저에게 직접 제재를 적용합니다." : "제재 타입: CONTENT_DELETE (콘텐츠 삭제)"}
            </p>
          </div>

          {isUserType ? (
            /* USER 타입: 제재 종류 + 사유 직접 선택 */
            <>
              <div>
                <label className="text-moa-subtle mb-1 block text-xs font-medium">
                  제재 종류 <span className="text-red-500">*</span>
                </label>
                <select
                  value={userSanctionType}
                  onChange={(e) => setUserSanctionType(e.target.value as SanctionType)}
                  className="border-moa-border focus:border-moa-primary text-moa-text h-9 w-full cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors"
                >
                  {SANCTION_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-moa-text mb-1.5 block text-sm font-semibold">
                  제재 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={userSanctionReason}
                  onChange={(e) => setUserSanctionReason(e.target.value)}
                  placeholder="제재 사유를 입력하세요 (필수)"
                  rows={3}
                  className="border-moa-border focus:border-moa-primary text-moa-text w-full resize-none rounded-xl border p-3 text-sm outline-none transition-colors"
                />
              </div>
            </>
          ) : (
            /* 콘텐츠 타입: 삭제 사유 + 추가 유저 제재 */
            <>
              <div>
                <label className="text-moa-text mb-1.5 block text-sm font-semibold">
                  {label} 삭제 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`${label} 삭제 사유를 입력하세요 (필수)`}
                  rows={3}
                  className="border-moa-border focus:border-moa-primary text-moa-text w-full resize-none rounded-xl border p-3 text-sm outline-none transition-colors"
                />
              </div>

              <div className="border-moa-border rounded-xl border p-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addUserSanction}
                    onChange={(e) => setAddUserSanction(e.target.checked)}
                    className="accent-moa-primary h-4 w-4"
                  />
                  <span className="text-moa-text text-sm font-medium">
                    추가 유저 제재
                  </span>
                </label>

                {addUserSanction && (
                  <div className="mt-3 flex flex-col gap-3">
                    <div>
                      <label className="text-moa-subtle mb-1 block text-xs font-medium">
                        제재 종류
                      </label>
                      <select
                        value={userSanctionType}
                        onChange={(e) =>
                          setUserSanctionType(e.target.value as SanctionType)
                        }
                        className="border-moa-border focus:border-moa-primary text-moa-text h-9 w-full cursor-pointer rounded-lg border px-3 text-sm outline-none transition-colors"
                      >
                        {SANCTION_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-moa-text mb-1.5 block text-sm font-semibold">
                        유저 제재 사유 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={userSanctionReason}
                        onChange={(e) => setUserSanctionReason(e.target.value)}
                        placeholder="유저 제재 사유를 입력하세요 (필수)"
                        rows={2}
                        className="border-moa-border focus:border-moa-primary text-moa-text w-full resize-none rounded-xl border p-3 text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-moa-border flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="border-moa-border text-moa-text hover:bg-moa-light cursor-pointer rounded-xl border px-5 py-2 text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="cursor-pointer rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-40"
          >
            {loading ? "처리 중..." : "삭제 실행"}
          </button>
        </div>
      </div>
    </div>
  );
}
