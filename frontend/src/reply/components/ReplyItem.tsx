import { useState } from "react";
import type { ReplyResponse } from "../types/replyTypes";
import { formatDateTime } from "../../post/utils/dateFormat";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(reply.content);
  const [error, setError] = useState("");

  const isOwner = !!currentUserPublicId && reply.authorPublicId === currentUserPublicId;
  const canEdit = !reply.deleted && isOwner;
  const canDelete = !reply.deleted && (isOwner || (canDeleteAsAdmin && isAdmin));
  const canCreateChild = allowChildReply && canWrite && !reply.deleted && reply.depth < 2;

  const submitUpdate = async () => {
    const trimmed = editingContent.trim();
    if (!trimmed) {
      setError("댓글 내용을 입력하세요.");
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
    <li style={{ padding: "12px 0", borderBottom: "1px solid #f2f2f2" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>{reply.authorName}</p>
      {!reply.deleted && isEditing ? (
        <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
          {error && <p style={{ margin: 0, color: "#dc2626" }}>{error}</p>}
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={2}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => void submitUpdate()}>
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
        <p style={{ margin: "6px 0", whiteSpace: "pre-wrap" }}>{reply.deleted ? "삭제된 댓글입니다." : reply.content}</p>
      )}
      <p style={{ margin: 0, fontSize: 12, color: "#777" }}>{formatDateTime(reply.createDate)}</p>
      {!reply.deleted && !isEditing && (
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {canEdit && (
            <button type="button" onClick={() => setIsEditing(true)} style={{ border: "none", background: "none", padding: 0 }}>
              수정
            </button>
          )}
          {canDelete && (
            <button type="button" onClick={() => void submitDelete()} style={{ border: "none", background: "none", padding: 0 }}>
              삭제
            </button>
          )}
          {canCreateChild && (
            <button
              type="button"
              onClick={() => setShowChildForm((prev) => !prev)}
              style={{ border: "none", background: "none", color: "#555", cursor: "pointer", padding: 0 }}
            >
              {showChildForm ? "대댓글 닫기" : "대댓글 작성"}
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
            onSubmitReply={(content, parentId) => onCreateChild(content, parentId ?? reply.replyId)}
            onSuccess={() => setShowChildForm(false)}
          />
        </div>
      )}

      {childrenReplies.length > 0 && (
        <ul style={{ listStyle: "none", margin: "8px 0 0 12px", padding: 0 }}>
          {childrenReplies.map((child) => (
            <li key={child.replyId} style={{ borderLeft: "2px solid #eee", paddingLeft: 10, marginBottom: 8, listStyle: "none" }}>
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
    </li>
  );
}
