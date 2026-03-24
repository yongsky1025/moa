import { useState, type FormEvent } from "react";
import { hasProfanity } from "../../common/utils/profanityFilter";
import { validateReplyContent } from "../utils/replyValidators";
import "../styles/replySection.css";

interface ReplyFormProps {
  postId: number;
  parentId?: number;
  onSuccess: () => void;
  onSubmitReply: (content: string, parentId?: number) => Promise<void>;
  variant?: "default" | "panel";
  submitLabel?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  currentUserName?: string;
}

export default function ReplyForm({
  parentId,
  onSuccess,
  onSubmitReply,
  variant = "default",
  submitLabel,
  showCancelButton = false,
  onCancel,
  currentUserName = "나",
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
    const profileInitial = currentUserName.trim().charAt(0) || "나";

    return (
      <form onSubmit={submit} className="reply-panel-form">
        {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
        {hasBadWord && <p style={{ color: "#dc2626", margin: 0 }}>부적절한 표현이 포함되어 있습니다.</p>}
        <div className="reply-panel-input-row">
          <div className="reply-avatar" aria-hidden="true">
            {profileInitial}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요"
            className="reply-panel-textarea"
          />
          <button
            type="submit"
            disabled={disableSubmit}
            className="reply-panel-submit"
            aria-label="댓글 등록"
          >
            등록
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
