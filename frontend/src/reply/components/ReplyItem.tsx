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
  const [showMore, setShowMore] = useState(false);
  const [editingContent, setEditingContent] = useState(reply.content);
  const [error, setError] = useState("");
  const hasEditingBadWord = hasProfanity(editingContent);
  const disableEditSave = hasEditingBadWord || !editingContent.trim();

  const isOwner =
    !!currentUserPublicId && reply.authorPublicId === currentUserPublicId;
  const canEdit = !reply.deleted && isOwner;
  const canDelete = !reply.deleted && (isOwner || (canDeleteAsAdmin && isAdmin));
  const canReport = !reply.deleted && canWrite && !isOwner;
  const canCreateChild = allowChildReply && canWrite && !reply.deleted && reply.depth < 2;
  const childCount = childrenReplies.length;
  const authorInitial = reply.authorName?.trim().charAt(0) || "?";
  const actionLikeCount = reply.replyCount ?? 0;

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

  const metaText = `${reply.authorName} · ${formatDateTime(reply.createDate)}`;

  return (
    <li className="reply-card">
      <div className="reply-header">
        <div className="reply-avatar">{authorInitial}</div>
        <p className="reply-meta-line">{metaText}</p>
      </div>

      {!reply.deleted && isEditing ? (
        <div className="reply-edit-area">
          {error && <p className="reply-error">{error}</p>}
          {hasEditingBadWord && (
            <p className="reply-error">부적절한 표현이 포함되어 있습니다.</p>
          )}
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={3}
            className="reply-edit-textarea"
          />
          <div className="reply-edit-actions">
            <button
              type="button"
              disabled={disableEditSave}
              onClick={() => void submitUpdate()}
              className="reply-flat-btn"
            >
              저장
            </button>
            <button
              type="button"
              className="reply-flat-btn"
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
        <p className="reply-content">
          {reply.deleted ? "삭제된 댓글입니다." : reply.content}
        </p>
      )}

      {!reply.deleted && !isEditing && (
        <div className="reply-item-actions">
          <button type="button" className="reply-action-btn">
            👍 {actionLikeCount}
          </button>
          {canCreateChild && (
            <button
              type="button"
              className="reply-action-btn"
              onClick={() => setShowChildForm((prev) => !prev)}
            >
              답글
            </button>
          )}
          {(canEdit || canDelete || canReport) && (
            <div className="reply-more-wrap">
              <button
                type="button"
                className="reply-more-btn"
                aria-label="댓글 더보기"
                onClick={() => setShowMore((prev) => !prev)}
              >
                ⋯
              </button>
              {showMore && (
                <div className="reply-more-menu">
                  {canEdit && (
                    <button
                      type="button"
                      className="reply-more-item"
                      onClick={() => {
                        setShowMore(false);
                        setIsEditing(true);
                      }}
                    >
                      수정
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="reply-more-item reply-more-item-danger"
                      onClick={() => {
                        setShowMore(false);
                        void submitDelete();
                      }}
                    >
                      삭제
                    </button>
                  )}
                  {canReport && (
                    <button
                      type="button"
                      className="reply-more-item"
                      onClick={() => {
                        setShowMore(false);
                        window.alert("신고 기능은 준비 중입니다.");
                      }}
                    >
                      신고
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && !isEditing && <p className="reply-error">{error}</p>}

      {canCreateChild && showChildForm && (
        <div style={{ marginTop: 10 }}>
          <ReplyForm
            postId={postId}
            parentId={reply.replyId}
            submitLabel="답글"
            showCancelButton
            onCancel={() => setShowChildForm(false)}
            onSubmitReply={(content, parentId) =>
              onCreateChild(content, parentId ?? reply.replyId)
            }
            onSuccess={() => setShowChildForm(false)}
          />
        </div>
      )}

      {childrenReplies.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowChildren((prev) => !prev)}
            className="reply-children-toggle"
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
            {showChildren ? "답글 숨기기" : `답글 ${childCount}개 보기`}
          </button>
          {showChildren && (
            <ul className="reply-children-list">
              {childrenReplies.map((child) => (
                <ReplyItem
                  key={child.replyId}
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
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}
