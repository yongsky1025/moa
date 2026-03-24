import type { ReplyReactionSummary, ReplyTreeNode } from "../types/replyTypes";
import ReplyItem from "./ReplyItem";
import { formatDateTime } from "../../post/utils/dateFormat";
import "../styles/replySection.css";

interface ReplyListProps {
  postId: number;
  tree: ReplyTreeNode[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => Promise<void>;
  currentUserPublicId?: string;
  currentUserName?: string;
  isAdmin: boolean;
  canWrite: boolean;
  canDeleteAsAdmin: boolean;
  onUpdate: (replyId: number, content: string) => Promise<void>;
  onDelete: (replyId: number) => Promise<void>;
  onCreateChild: (
    content: string,
    targetReplyId: number,
    expandParentId: number,
  ) => Promise<void>;
  onReact: (replyId: number) => Promise<ReplyReactionSummary>;
  autoExpandParentId?: number | null;
  focusReplyId?: number | null;
  onFocusReplyHandled?: () => void;
  onFocusReply?: (replyId: number, expandParentId?: number) => void;
}

export default function ReplyList({
  postId,
  tree,
  hasMore,
  loadingMore,
  onLoadMore,
  currentUserPublicId,
  currentUserName,
  isAdmin,
  canWrite,
  canDeleteAsAdmin,
  onUpdate,
  onDelete,
  onCreateChild,
  onReact,
  autoExpandParentId = null,
  focusReplyId = null,
  onFocusReplyHandled,
  onFocusReply,
}: ReplyListProps) {
  const bestReplies = tree
    .flatMap((root) => [{ node: root, rootId: root.replyId }, ...root.children.map((child) => ({ node: child, rootId: root.replyId }))])
    .filter(({ node }) => !node.deleted && node.likeCount > 0)
    .sort((a, b) => {
      if (b.node.likeCount !== a.node.likeCount) return b.node.likeCount - a.node.likeCount;
      if (a.node.createDate !== b.node.createDate) {
        return new Date(a.node.createDate).getTime() - new Date(b.node.createDate).getTime();
      }
      return a.node.replyId - b.node.replyId;
    })
    .slice(0, 3);

  if (tree.length === 0) {
    return (
      <div className="reply-empty-card">
        <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>아직 댓글이 없습니다.</p>
        <p style={{ margin: "6px 0 0", fontSize: 14 }}>첫 댓글을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <>
      {bestReplies.length > 0 && (
        <section className="reply-best-section" aria-label="베스트 댓글">
          <h4 className="reply-best-title">베스트 댓글</h4>
          <ul className="reply-best-list">
            {bestReplies.map(({ node: reply, rootId }) => (
              <li key={`best-${reply.replyId}`} className="reply-best-card">
                <div className="reply-best-meta">
                  <span>{reply.authorName}</span>
                  <span>{formatDateTime(reply.createDate)}</span>
                </div>
                <p className="reply-best-content">{reply.content}</p>
                <div className="reply-best-footer">
                  <span className="reply-best-like">👍 {reply.likeCount}</span>
                  <button
                    type="button"
                    className="reply-best-jump"
                    onClick={() => onFocusReply?.(reply.replyId, rootId)}
                  >
                    원문 보기
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="reply-list">
        {tree.map((reply) => (
          <ReplyItem
            key={reply.replyId}
            postId={postId}
            reply={reply}
            childrenReplies={reply.children}
            currentUserPublicId={currentUserPublicId}
            currentUserName={currentUserName}
            isAdmin={isAdmin}
            canWrite={canWrite}
            canDeleteAsAdmin={canDeleteAsAdmin}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCreateChild={onCreateChild}
            onReact={onReact}
            autoExpandParentId={autoExpandParentId}
            focusReplyId={focusReplyId}
            onFocusReplyHandled={onFocusReplyHandled}
          />
        ))}
      </ul>
      {hasMore && (
        <div className="reply-load-more-wrap">
          <button
            type="button"
            className="reply-load-more-btn"
            onClick={() => void onLoadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? "불러오는 중..." : "댓글 더보기"}
          </button>
        </div>
      )}
    </>
  );
}
