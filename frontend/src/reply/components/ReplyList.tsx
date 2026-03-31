import { useEffect, useRef } from "react";
import { ReplyListSkeleton } from "../../common/components/BoardLoadingSkeletons";
import type { ReplyTreeNode } from "../types/replyTypes";
import ReplyItem from "./ReplyItem";
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
  autoExpandParentId?: number | null;
  focusReplyId?: number | null;
  onFocusReplyHandled?: () => void;
  onRequireLogin?: () => void;
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
  autoExpandParentId = null,
  focusReplyId = null,
  onFocusReplyHandled,
  onRequireLogin,
}: ReplyListProps) {
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const target = loadMoreSentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (loadingMore) return;
        void onLoadMore();
      },
      {
        root: null,
        rootMargin: "240px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

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
            autoExpandParentId={autoExpandParentId}
            focusReplyId={focusReplyId}
            onFocusReplyHandled={onFocusReplyHandled}
            onRequireLogin={onRequireLogin}
          />
        ))}
      </ul>
      {hasMore && (
        <div className="reply-load-more-wrap" ref={loadMoreSentinelRef} aria-live="polite">
          {loadingMore && <ReplyListSkeleton count={2} withTopMargin={false} />}
        </div>
      )}
    </>
  );
}
