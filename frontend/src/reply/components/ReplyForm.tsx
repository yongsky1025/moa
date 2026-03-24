import { useEffect, useState, type FormEvent } from "react";
import { hasProfanity } from "../../common/utils/profanityFilter";
import { validateReplyContent } from "../utils/replyValidators";
import ReplyComposer from "./ReplyComposer";
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
  canWrite?: boolean;
  onRequireLogin?: () => void;
  initialContent?: string;
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
  canWrite = true,
  onRequireLogin,
  initialContent,
}: ReplyFormProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasBadWord = hasProfanity(content);
  const disableSubmit = canWrite
    ? submitting || hasBadWord || !content.trim()
    : false;
  const submitText = submitLabel ?? (parentId ? "답글" : "댓글 등록");
  const submitButtonText = variant === "panel"
    ? (canWrite ? "등록" : "로그인")
    : (submitting ? "저장 중..." : submitText);

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent, parentId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      onRequireLogin?.();
      return;
    }
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
      <form onSubmit={submit} className="reply-panel-form">
        {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
        {hasBadWord && <p style={{ color: "#dc2626", margin: 0 }}>부적절한 표현이 포함되어 있습니다.</p>}
        <ReplyComposer
          variant="panel"
          content={content}
          onChangeContent={(e) => setContent(e.target.value)}
          canWrite={canWrite}
          currentUserName={currentUserName}
          disableSubmit={disableSubmit}
          submitButtonText={submitButtonText}
          submitAriaLabel="댓글 등록"
        />
      </form>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
      {hasBadWord && <p style={{ color: "#dc2626", margin: 0 }}>부적절한 표현이 포함되어 있습니다.</p>}
      <ReplyComposer
        variant="default"
        content={content}
        onChangeContent={(e) => setContent(e.target.value)}
        canWrite={canWrite}
        currentUserName={currentUserName}
        disableSubmit={disableSubmit}
        submitButtonText={submitButtonText}
        parentId={parentId}
        showCancelButton={showCancelButton}
        onCancel={onCancel}
      />
    </form>
  );
}
