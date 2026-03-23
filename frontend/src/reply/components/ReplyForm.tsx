import { useState, type FormEvent } from "react";
import { hasProfanity } from "../../common/utils/profanityFilter";
import { validateReplyContent } from "../utils/replyValidators";

interface ReplyFormProps {
  postId: number;
  parentId?: number;
  onSuccess: () => void;
  onSubmitReply: (content: string, parentId?: number) => Promise<void>;
  variant?: "default" | "panel";
  submitLabel?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export default function ReplyForm({
  parentId,
  onSuccess,
  onSubmitReply,
  variant = "default",
  submitLabel,
  showCancelButton = false,
  onCancel,
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasBadWord = hasProfanity(content);
  const disableSubmit = submitting || hasBadWord || !content.trim();
  const submitText = submitLabel ?? (parentId ? "답글" : "댓글 등록");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const message = validateReplyContent(content);
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmitReply(content, parentId);
      setContent("");
      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "댓글 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === "panel") {
    return (
      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 8,
          backgroundColor: "#fff",
          border: "1px solid #d6d9dd",
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          padding: 24,
        }}
      >
        {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
        {hasBadWord && <p style={{ color: "#dc2626", margin: 0 }}>부적절한 표현이 포함되어 있습니다.</p>}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요"
            style={{
              flex: 1,
              padding: 14,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              resize: "vertical",
            }}
          />
          <button
            type="submit"
            disabled={disableSubmit}
            style={{
              width: 46,
              height: 46,
              borderRadius: 8,
              border: "1px solid #c9ccd1",
              backgroundColor: disableSubmit ? "#e5e7eb" : "#8c8f94",
              color: "#fff",
              cursor: disableSubmit ? "not-allowed" : "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
            aria-label="댓글 등록"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 11.5 20.5 4l-7.3 16-2.2-6.3L3 11.5Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
      {hasBadWord && <p style={{ color: "#dc2626", margin: 0 }}>부적절한 표현이 포함되어 있습니다.</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        placeholder={parentId ? "대댓글을 입력하세요" : "댓글을 입력하세요"}
        style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {showCancelButton && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              minWidth: 80,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#4b5563",
              cursor: "pointer",
            }}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={disableSubmit}
          style={{
            minWidth: 80,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #111",
            background: "white",
          }}
        >
          {submitting ? "저장 중..." : submitText}
        </button>
      </div>
    </form>
  );
}
