import type { ChangeEventHandler } from "react";

interface ReplyComposerProps {
  variant: "default" | "panel";
  content: string;
  onChangeContent: ChangeEventHandler<HTMLTextAreaElement>;
  canWrite: boolean;
  currentUserName: string;
  disableSubmit: boolean;
  submitButtonText: string;
  submitAriaLabel?: string;
  parentId?: number;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export default function ReplyComposer({
  variant,
  content,
  onChangeContent,
  canWrite,
  currentUserName,
  disableSubmit,
  submitButtonText,
  submitAriaLabel = "댓글 등록",
  parentId,
  showCancelButton = false,
  onCancel,
}: ReplyComposerProps) {
  if (variant === "panel") {
    const profileInitial = currentUserName.trim().charAt(0) || "나";

    return (
      <div className="reply-panel-input-row">
        <div className="reply-avatar" aria-hidden="true">
          {profileInitial}
        </div>
        {canWrite ? (
          <textarea
            value={content}
            onChange={onChangeContent}
            rows={3}
            placeholder="댓글을 입력하세요"
            className="reply-panel-textarea"
          />
        ) : (
          <div className="reply-panel-readonly-hint" aria-disabled="true">
            로그인해야 댓글 입력이 가능합니다.
          </div>
        )}
        <button
          type="submit"
          disabled={disableSubmit}
          className="reply-panel-submit"
          aria-label={submitAriaLabel}
        >
          {submitButtonText}
        </button>
      </div>
    );
  }

  return (
    <>
      <textarea
        value={content}
        onChange={onChangeContent}
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
          {submitButtonText}
        </button>
      </div>
    </>
  );
}
