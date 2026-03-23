import { useState } from "react";
import type { ReplyResponse } from "../types/replyTypes";
import { formatDateTime } from "../../post/utils/dateFormat";
import { hasProfanity } from "../../common/utils/profanityFilter";
import { validateReplyContent } from "../utils/replyValidators";
import ReplyForm from "./ReplyForm";

interface ReplyItemProps {
  postId: number;
  reply: ReplyResponse;
  childrenReplies?: ReplyResponse[];
  currentUserPublicId?: string;
  isAdmin: boolean;
  canWrite: boolean;
  canDeleteAsAdmin: boolean;
  onUpdate: (replyId: number, content: string) => Promise<void>;
  onDelete: (replyId: number) => Promise<void>;
  onCreateChild: (content: string, parentId: number) => Promise<void>;
  allowChildReply?: boolean;
}

export default function ReplyItem({
  postId,
  reply,
  childrenReplies = [],
  currentUserPublicId,
  isAdmin,
  canWrite,
  canDeleteAsAdmin,
  onUpdate,
  onDelete,
  onCreateChild,
  allowChildReply = true,
}: ReplyItemProps) {
  const [showChildForm, setShowChildForm] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(reply.content);
  const [error, setError] = useState("");
  const hasEditingBadWord = hasProfanity(editingContent);
  const disableEditSave = hasEditingBadWord || !editingContent.trim();

  const isOwner = !!currentUserPublicId && reply.authorPublicId === currentUserPublicId;
  const canEdit = !reply.deleted && isOwner;
  const canDelete = !reply.deleted && (isOwner || (canDeleteAsAdmin && isAdmin));
  const canCreateChild = allowChildReply && canWrite && !reply.deleted && reply.depth < 2;
  const childCount = childrenReplies.length;
  const authorInitial = reply.authorName?.trim().charAt(0) || "?";

  const submitUpdate = async () => {
    const trimmed = editingContent.trim();
    const message = validateReplyContent(trimmed);
    if (message) {
      setError(message);
      return;
    }

    setError("");
    try {
      await onUpdate(reply.replyId, trimmed);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "댓글 수정에 실패했습니다.");
    }
  };

  const submitDelete = async () => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    setError("");
    try {
      await onDelete(reply.replyId);
      window.alert("댓글 삭제가 완료되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <li
      style={{
        backgroundColor: "#fff",
        border: "1px solid #d6d9dd",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#f3f4f6",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {authorInitial}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 28 / 2 }}>{reply.authorName}</p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{formatDateTime(reply.createDate)}</p>
        </div>
      </div>
      {!reply.deleted && isEditing ? (
        <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
          {error && <p style={{ margin: 0, color: "#dc2626" }}>{error}</p>}
          {hasEditingBadWord && <p style={{ margin: 0, color: "#dc2626" }}>부적절한 표현이 포함되어 있습니다.</p>}
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={2}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" disabled={disableEditSave} onClick={() => void submitUpdate()}>
              저장
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingContent(reply.content);
                setError("");
              }}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p style={{ margin: "10px 0 0", whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.7 }}>
          {reply.deleted ? "삭제된 댓글입니다." : reply.content}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#4b5563", fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 10v10H3V10h4Zm2 10h7.2a2 2 0 0 0 2-1.7l1-6.5A2 2 0 0 0 17.2 9H13l.6-3.2A2.5 2.5 0 0 0 11.2 3L9 7.4V20Z"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span>{reply.replyCount ?? 0}</span>
        </span>
      </div>
      {!reply.deleted && !isEditing && (
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{ border: "none", background: "none", padding: 0, color: "#4b5563", cursor: "pointer" }}
            >
              수정
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => void submitDelete()}
              style={{ border: "none", background: "none", padding: 0, color: "#4b5563", cursor: "pointer" }}
            >
              삭제
            </button>
          )}
          {canCreateChild && (
            <button
              type="button"
              onClick={() => setShowChildForm(true)}
              style={{ border: "none", background: "none", color: "#555", cursor: "pointer", padding: 0 }}
            >
              답글
            </button>
          )}
        </div>
      )}
      {error && !isEditing && <p style={{ margin: "6px 0 0", color: "#dc2626" }}>{error}</p>}

      {canCreateChild && showChildForm && (
        <div style={{ marginTop: 8 }}>
          <ReplyForm
            postId={postId}
            parentId={reply.replyId}
            submitLabel="답글"
            showCancelButton
            onCancel={() => setShowChildForm(false)}
            onSubmitReply={(content, parentId) => onCreateChild(content, parentId ?? reply.replyId)}
            onSuccess={() => setShowChildForm(false)}
          />
        </div>
      )}

      {childrenReplies.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowChildren((prev) => !prev)}
            style={{
              marginTop: 10,
              border: "none",
              background: "none",
              color: "#2563eb",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={showChildren ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {showChildren ? "답글 숨기기" : `답글 ${childCount}개`}
          </button>
          {showChildren && (
            <ul style={{ listStyle: "none", margin: "12px 0 0 12px", padding: 0, display: "grid", gap: 10 }}>
              {childrenReplies.map((child) => (
                <li key={child.replyId} style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: 10, listStyle: "none" }}>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    <ReplyItem
                      postId={postId}
                      reply={child}
                      currentUserPublicId={currentUserPublicId}
                      isAdmin={isAdmin}
                      canWrite={canWrite}
                      canDeleteAsAdmin={canDeleteAsAdmin}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onCreateChild={onCreateChild}
                      allowChildReply={false}
                    />
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}
