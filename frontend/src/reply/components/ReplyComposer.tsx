import { useEffect, useRef, type ChangeEventHandler } from "react";
import UserAvatar from "../../common/components/UserAvatar";

interface ReplyComposerProps {
  variant: "default" | "panel";
  content: string;
  onChangeContent: ChangeEventHandler<HTMLTextAreaElement>;
  mentionPrefix?: string;
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
  mentionPrefix,
  canWrite,
  currentUserName,
  disableSubmit,
  submitButtonText,
  submitAriaLabel = "댓글 등록",
  parentId,
  showCancelButton = false,
  onCancel,
}: ReplyComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasTypedContent = content.trim().length > 0;
  const mentionLabel = mentionPrefix?.trim() ?? "";
  const showInlineSubmit = !showCancelButton && hasTypedContent;
  const placeholder =
    variant === "panel"
      ? "댓글 추가..."
      : parentId
        ? "답글 추가..."
        : "댓글 추가...";

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "34px";
    const nextHeight = Math.min(el.scrollHeight, 220);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 220 ? "auto" : "hidden";
  }, [content, mentionLabel, variant]);

  return (
    <div className="reply-panel-input-row">
      <UserAvatar
        name={currentUserName}
        size={40}
        className="reply-avatar"
        ariaHidden
        initialMode="nickname"
      />
      <div className="reply-panel-editor">
        {canWrite ? (
          <>
            <div className="reply-panel-input-main">
              <div className="reply-panel-textarea-shell">
                {mentionLabel && (
                  <span className="reply-mention-text reply-input-mention-prefix">
                    {mentionLabel}
                  </span>
                )}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={onChangeContent}
                  rows={1}
                  placeholder={placeholder}
                  className="reply-panel-textarea"
                  style={{
                    minHeight: 34,
                    height: 34,
                    resize: "none",
                  }}
                />
              </div>
              {showInlineSubmit && (
                <button
                  type="submit"
                  disabled={disableSubmit}
                  className="reply-panel-submit"
                  aria-label={submitAriaLabel}
                >
                  {submitButtonText}
                </button>
              )}
            </div>
            {showCancelButton && (
              <div className="reply-panel-actions">
                <button
                  type="button"
                  className="reply-panel-cancel"
                  onClick={onCancel}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={disableSubmit}
                  className="reply-panel-submit"
                  aria-label={submitAriaLabel}
                >
                  {submitButtonText}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="reply-panel-readonly-hint" aria-disabled="true">
            로그인해야 댓글 입력이 가능합니다.
          </div>
        )}
      </div>
    </div>
  );
}
