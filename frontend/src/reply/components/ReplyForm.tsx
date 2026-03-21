import { useState, type FormEvent } from "react";
import { validateReplyContent } from "../utils/replyValidators";

interface ReplyFormProps {
  postId: number;
  parentId?: number;
  onSuccess: () => void;
  onSubmitReply: (content: string, parentId?: number) => Promise<void>;
}

export default function ReplyForm({ parentId, onSuccess, onSubmitReply }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        placeholder={parentId ? "대댓글을 입력하세요" : "댓글을 입력하세요"}
        style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
      />
      <button
        type="submit"
        disabled={submitting}
        style={{ width: 100, padding: "8px 10px", borderRadius: 8, border: "1px solid #111", background: "white" }}
      >
        {submitting ? "저장 중..." : "댓글 등록"}
      </button>
    </form>
  );
}
