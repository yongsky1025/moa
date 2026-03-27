import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { replyApi } from "../api/replyApi";
import type {
  ReplyReactionSummary,
  ReplyResponse,
  ReplyTreeNode,
} from "../types/replyTypes";
import { formatDateTime } from "../../post/utils/dateFormat";
import { hasProfanity } from "../../common/utils/profanityFilter";
import { validateReplyContent } from "../utils/replyValidators";
import ReplyForm from "./ReplyForm";

interface ReplyItemProps {
  postId: number;
  reply: ReplyTreeNode;
  childrenReplies?: ReplyTreeNode[];
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
  rootAuthorUserId?: number | null;
  onRequireLogin?: () => void;
}

function applyLocalReplyReaction(current: ReplyReactionSummary): ReplyReactionSummary {
  if (current.myReaction === "LIKE") {
    return {
      ...current,
      likeCount: Math.max(0, current.likeCount - 1),
      myReaction: null,
    };
  }
  return {
    ...current,
    likeCount: current.likeCount + 1,
    myReaction: "LIKE",
  };
}

function hasDescendantReplyId(
  nodes: ReplyTreeNode[],
  targetReplyId: number,
): boolean {
  for (const node of nodes) {
    if (node.replyId === targetReplyId) {
      return true;
    }
    if (
      node.children.length > 0 &&
      hasDescendantReplyId(node.children, targetReplyId)
    ) {
      return true;
    }
  }
  return false;
}

export default function ReplyItem({
  postId,
  reply,
  childrenReplies = [],
  currentUserPublicId,
  currentUserName = "나",
  isAdmin,
  canWrite,
  canDeleteAsAdmin,
  onUpdate,
  onDelete,
  onCreateChild,
  autoExpandParentId = null,
  focusReplyId = null,
  onFocusReplyHandled,
  rootAuthorUserId = null,
  onRequireLogin,
}: ReplyItemProps) {
  const queryClient = useQueryClient();
  const [showChildForm, setShowChildForm] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpandContent, setCanExpandContent] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [editingContent, setEditingContent] = useState(reply.content);
  const [error, setError] = useState("");
  const [reactionError, setReactionError] = useState("");
  const [localReplyReaction, setLocalReplyReaction] = useState<ReplyReactionSummary>({
    likeCount: reply.likeCount,
    myReaction: reply.myReaction,
  });
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const reactAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactCommitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingReplyLikeParityRef = useRef(0);
  const hasEditingBadWord = hasProfanity(editingContent);
  const disableEditSave = hasEditingBadWord || !editingContent.trim();

  const isOwner =
    !!currentUserPublicId && reply.authorPublicId === currentUserPublicId;
  const canEdit = !reply.deleted && isOwner;
  const canDelete =
    !reply.deleted && (isOwner || (canDeleteAsAdmin && isAdmin));
  const canReport = !reply.deleted && canWrite && !isOwner;
  const canCreateChild = canWrite && !reply.deleted;
  const childCount = Math.max(reply.replyCount ?? 0, childrenReplies.length);
  const authorInitial = reply.authorName?.trim().charAt(0) || "?";
  const actionLikeCount = localReplyReaction.likeCount;
  const isLiked = localReplyReaction.myReaction === "LIKE";
  const mentionPrefix = reply.authorName?.trim()
    ? `@${reply.authorName.trim()} `
    : "";
  const expandParentId = reply.parentId ?? reply.replyId;

  useEffect(() => {
    if (autoExpandParentId === reply.replyId && childCount > 0) {
      setShowChildren(true);
    }
  }, [autoExpandParentId, reply.replyId, childCount]);

  useEffect(() => {
    if (!focusReplyId || focusReplyId !== reply.replyId) return;
    const element = itemRef.current;
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    onFocusReplyHandled?.();
  }, [focusReplyId, reply.replyId, onFocusReplyHandled]);

  useEffect(() => {
    if (!focusReplyId || showChildren || childrenReplies.length === 0) {
      return;
    }
    if (hasDescendantReplyId(childrenReplies, focusReplyId)) {
      setShowChildren(true);
    }
  }, [childrenReplies, focusReplyId, showChildren]);

  useEffect(() => {
    setReactionError("");
  }, [reply.likeCount, reply.myReaction]);

  useEffect(() => {
    if (pendingReplyLikeParityRef.current % 2 === 1 || reactionMutation.isPending) {
      return;
    }
    setLocalReplyReaction({
      likeCount: reply.likeCount,
      myReaction: reply.myReaction,
    });
  }, [reply.replyId, reply.likeCount, reply.myReaction]);

  useEffect(() => {
    return () => {
      if (reactAnimationResetRef.current) {
        clearTimeout(reactAnimationResetRef.current);
      }
      if (reactCommitDebounceRef.current) {
        clearTimeout(reactCommitDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showMore) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && moreMenuRef.current?.contains(target)) {
        return;
      }
      setShowMore(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMore]);

  const reactionMutation = useMutation<ReplyReactionSummary, Error>({
    mutationFn: async () =>
      (await replyApi.reactToReply(postId, reply.replyId)).data,
    onSuccess: () => {
      setReactionError("");
    },
    onError: (error) => {
      setLocalReplyReaction((current) => applyLocalReplyReaction(current));
      const repliesQueryKey = ["postReplies", postId] as const;
      queryClient.setQueriesData<InfiniteData<{ content: ReplyResponse[] }>>(
        { queryKey: repliesQueryKey },
        (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              content: page.content.map((item) =>
                item.replyId === reply.replyId
                  ? {
                      ...item,
                      likeCount:
                        item.myReaction === "LIKE"
                          ? Math.max(0, item.likeCount - 1)
                          : item.likeCount + 1,
                      myReaction: item.myReaction === "LIKE" ? null : "LIKE",
                    }
                  : item,
              ),
            })),
          };
        },
      );
      setReactionError(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.");
    },
    onSettled: () => {
      if (pendingReplyLikeParityRef.current % 2 === 1) {
        scheduleReplyLikeCommit();
      }
    },
  });

  const scheduleReplyLikeCommit = () => {
    if (reactCommitDebounceRef.current) {
      clearTimeout(reactCommitDebounceRef.current);
    }
    reactCommitDebounceRef.current = setTimeout(() => {
      if (pendingReplyLikeParityRef.current % 2 === 0) {
        return;
      }
      if (reactionMutation.isPending) {
        scheduleReplyLikeCommit();
        return;
      }
      pendingReplyLikeParityRef.current = 0;
      reactionMutation.mutate();
    }, 200);
  };

  useEffect(() => {
    if (reply.deleted || isEditing) {
      setCanExpandContent(false);
      return;
    }
    if (isExpanded) {
      setCanExpandContent(true);
      return;
    }

    const checkOverflow = () => {
      const element = contentRef.current;
      if (!element) return;
      setCanExpandContent(element.scrollHeight - element.clientHeight > 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [reply.content, reply.deleted, isEditing, isExpanded]);

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

  const submitReaction = () => {
    if (!canWrite) {
      setReactionError("로그인 후 좋아요를 누를 수 있습니다.");
      onRequireLogin?.();
      return;
    }
    if (reply.deleted) return;

    setIsLikeAnimating(false);
    requestAnimationFrame(() => setIsLikeAnimating(true));
    if (reactAnimationResetRef.current) {
      clearTimeout(reactAnimationResetRef.current);
    }
    reactAnimationResetRef.current = setTimeout(() => {
      setIsLikeAnimating(false);
    }, 500);
    const repliesQueryKey = ["postReplies", postId] as const;
    setReactionError("");
    setLocalReplyReaction((current) => applyLocalReplyReaction(current));
    queryClient.setQueriesData<InfiniteData<{ content: ReplyResponse[] }>>(
      { queryKey: repliesQueryKey },
      (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            content: page.content.map((item) =>
              item.replyId === reply.replyId
                ? {
                    ...item,
                    likeCount:
                      item.myReaction === "LIKE"
                        ? Math.max(0, item.likeCount - 1)
                        : item.likeCount + 1,
                    myReaction: item.myReaction === "LIKE" ? null : "LIKE",
                  }
                : item,
            ),
          })),
        };
      },
    );
    pendingReplyLikeParityRef.current = (pendingReplyLikeParityRef.current + 1) % 2;
    scheduleReplyLikeCommit();
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
  const mentionMatch = reply.content.match(/^(@[^\s]+)([\s\S]*)$/);
  const mentionText =
    reply.replyToUserId && mentionMatch ? mentionMatch[1] : null;
  const contentWithoutMention = mentionText
    ? (mentionMatch?.[2] ?? "")
    : reply.content;
  const mentionSeparator =
    mentionText &&
    contentWithoutMention &&
    !contentWithoutMention.startsWith("\n")
      ? " "
      : "";
  const isChildReply = reply.depth > 0;
  const effectiveRootAuthorUserId =
    rootAuthorUserId ?? reply.authorUserId ?? null;
  const isDeepChildVisual =
    isChildReply &&
    effectiveRootAuthorUserId !== null &&
    reply.replyToUserId !== null &&
    reply.replyToUserId !== effectiveRootAuthorUserId;

  return (
    <li
      ref={itemRef}
      className={`reply-card ${isChildReply ? "reply-card-depth-1" : ""} ${isDeepChildVisual ? "reply-card-depth-2" : ""}`}
    >
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
                setIsExpanded(false);
                setError("");
              }}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p
          ref={contentRef}
          className={`reply-content ${!isExpanded ? "reply-content-collapsed" : ""}`}
        >
          {reply.deleted ? (
            "삭제된 댓글입니다."
          ) : mentionText ? (
            <>
              <span className="reply-mention-text">{mentionText}</span>
              {mentionSeparator}
              {contentWithoutMention}
            </>
          ) : (
            reply.content
          )}
        </p>
      )}

      {!reply.deleted && !isEditing && canExpandContent && (
        <button
          type="button"
          className="reply-read-more-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "접기" : "자세히 보기"}
        </button>
      )}

      {!reply.deleted && !isEditing && (
        <div className="reply-item-actions">
          <button
            type="button"
            className={`reply-like-btn ${isLiked ? "on" : ""} ${
              isLikeAnimating ? "pulse" : ""
            } ${!canWrite ? "disabled" : ""}`}
            onClick={() => void submitReaction()}
            disabled={reply.deleted}
            aria-pressed={isLiked}
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              size={16}
              strokeWidth={2}
              fill={isLiked ? "currentColor" : "none"}
              aria-hidden="true"
            />
            <span>{actionLikeCount}</span>
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
            <div ref={moreMenuRef} className="reply-more-wrap">
              <button
                type="button"
                className="reply-more-btn post-detail-more-button"
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
      {reactionError && <p className="reply-error">{reactionError}</p>}

      {canCreateChild && showChildForm && (
        <div style={{ marginTop: 10 }}>
          <ReplyForm
            postId={postId}
            parentId={reply.replyId}
            submitLabel="답글"
            showCancelButton
            onCancel={() => setShowChildForm(false)}
            onSubmitReply={(content, parentId) =>
              onCreateChild(content, parentId ?? reply.replyId, expandParentId)
            }
            onSuccess={() => setShowChildForm(false)}
            initialContent={mentionPrefix}
            currentUserName={currentUserName}
          />
        </div>
      )}

      {childCount > 0 && (
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
          {showChildren && childrenReplies.length > 0 && (
            <ul className="reply-children-list">
              {childrenReplies.map((child) => (
                <ReplyItem
                  key={child.replyId}
                  postId={postId}
                  reply={child}
                  childrenReplies={child.children}
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
                  rootAuthorUserId={effectiveRootAuthorUserId}
                  onRequireLogin={onRequireLogin}
                />
              ))}
            </ul>
          )}
          {showChildren && childrenReplies.length === 0 && (
            <p className="reply-error" style={{ marginTop: 8 }}>
              아직 불러오지 않은 답글이 있습니다. 댓글 더보기를 눌러주세요.
            </p>
          )}
        </>
      )}
    </li>
  );
}


