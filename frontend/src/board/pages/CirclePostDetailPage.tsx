import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import { BoardDetailSkeleton, ReplyListSkeleton } from "../../common/components/BoardLoadingSkeletons";
import PostDetailArticleCard from "../../post/components/PostDetailArticleCard";
import PostLikeButton from "../../post/components/PostLikeButton";
import PostActionMenu from "../../post/components/PostActionMenu";
import { usePostDetail } from "../../post/hooks/usePostDetail";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { postRoutes } from "../../post/routes/postRoutes";
import { useReplies } from "../../reply/hooks/useReplies";
import ReplyForm from "../../reply/components/ReplyForm";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import { replyApi } from "../../reply/api/replyApi";
import ReplyList from "../../reply/components/ReplyList";
import "../../reply/styles/replySection.css";
import { useAuthStore } from "../../store/authStore";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";
import { postApi } from "../../post/api/postApi";
import type { PostReactionSummary } from "../../post/types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

function applyLocalReaction(current: PostReactionSummary): PostReactionSummary {
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

export default function CirclePostDetailPage() {
  const { circleId, boardId, postId } = useParams<{
    circleId: string;
    boardId: string;
    postId: string;
  }>();
  const navigate = useNavigate();
  const circleIdNumber = parseRouteNumber(circleId);
  const boardIdNumber = parseRouteNumber(boardId);
  const postIdNumber = parseRouteNumber(postId);
  const hasValidParams = circleIdNumber !== null && boardIdNumber !== null && postIdNumber !== null;

  const { data, loading, error } = usePostDetail({
    kind: "circle",
    circleId: circleIdNumber ?? 0,
    boardId: boardIdNumber ?? 0,
    postId: postIdNumber ?? 0,
    enabled: hasValidParams,
  });
  const {
    tree,
    loading: replyLoading,
    loadingMore: replyLoadingMore,
    error: replyError,
    hasMore: hasMoreReplies,
    totalCount: totalReplyCount,
    refetch,
    refetchAll,
    loadMore,
  } = useReplies({
    postId: postIdNumber ?? 0,
    enabled: hasValidParams,
  });
  const { create, update, remove, error: replySubmitError } = useReplyForm();
  const { isLoggedIn, user } = useAuthStore();
  const isOwner = !!data && !!user && data.authorPublicId === user.publicId;
  const reactionPostId = postIdNumber ?? 0;
  const [reactionSummary, setReactionSummary] = useState<PostReactionSummary | null>(null);
  const [reactionError, setReactionError] = useState("");
  const [autoExpandParentId, setAutoExpandParentId] = useState<number | null>(null);
  const [focusReplyId, setFocusReplyId] = useState<number | null>(null);
  const showPostLoading = useDelayedLoading(loading, 180);
  const showReplyLoading = useDelayedLoading(replyLoading, 180);

  const refreshReplies = async (loadAll: boolean, keepScroll = true) => {
    const currentScrollY = keepScroll ? window.scrollY : 0;
    if (loadAll) {
      await refetchAll();
    } else {
      await refetch();
    }
    if (keepScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollY, behavior: "auto" });
      });
    }
  };

  useEffect(() => {
    setReactionSummary(null);
    setAutoExpandParentId(null);
    setFocusReplyId(null);
  }, [data?.postId]);

  const react = async () => {
    if (!isLoggedIn || !data) return;
    const baseReaction: PostReactionSummary = reactionSummary ?? {
      likeCount: data.likeCount,
      myReaction: data.myReaction,
    };
    const optimisticReaction = applyLocalReaction(baseReaction);

    setReactionSummary(optimisticReaction);
    setReactionError("");
    try {
      const response = await postApi.reactToPost(reactionPostId);
      setReactionSummary(response.data);
    } catch (e) {
      setReactionSummary(baseReaction);
      setReactionError(getErrorMessage(e));
    }
  };

  const removePost = async () => {
    if (!data) return;
    if (circleIdNumber === null || boardIdNumber === null) return;
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await postApi.deleteCirclePost(circleIdNumber, boardIdNumber, data.postId);
      window.alert("게시글이 삭제되었습니다.");
      navigate(postRoutes.circleBoard(circleIdNumber, boardIdNumber));
    } catch (e) {
      window.alert(getErrorMessage(e));
    }
  };

  if (!hasValidParams) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
        <Navbar />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
          <p style={{ color: "#dc2626" }}>잘못된 경로입니다.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader title="서클 게시판" backTo={postRoutes.circleBoard(circleIdNumber, boardIdNumber)} backLabel="목록으로 이동" />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {showPostLoading && <BoardDetailSkeleton />}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {data && (
          <>
            <PostDetailArticleCard
              post={data}
              headerAction={
                <PostActionMenu
                  canEdit={isOwner}
                  canDelete={isOwner}
                  canReport={isLoggedIn && !isOwner}
                  onEdit={() => navigate(postRoutes.circleEdit(circleIdNumber, boardIdNumber, postIdNumber))}
                  onDelete={() => void removePost()}
                  onReport={() => window.alert("신고 기능은 준비 중입니다.")}
                />
              }
              actionSection={
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <PostLikeButton
                    liked={(reactionSummary?.myReaction ?? data.myReaction) === "LIKE"}
                    likeCount={reactionSummary?.likeCount ?? data.likeCount}
                    disabled={!isLoggedIn}
                    onClick={() => void react()}
                    error={reactionError}
                    marginTop={0}
                  />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      color: "#111827",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    💬 댓글 {totalReplyCount}
                  </span>
                </div>
              }
            />

            <section className="reply-section">
              <h3 className="reply-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5v-7Z"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                댓글 {totalReplyCount}개
              </h3>
              <p className="reply-section-subtitle">의견을 남기고 대화를 이어가 보세요.</p>
              <ReplyForm
                postId={postIdNumber}
                variant="panel"
                currentUserName={user?.nickname}
                onRequireLogin={() => navigate("/users/login")}
                onSubmitReply={(content) => create({ postId: postIdNumber, content })}
                canWrite={isLoggedIn}
                onSuccess={(createdReplyId) => {
                  if (createdReplyId) {
                    setFocusReplyId(createdReplyId);
                  }
                  void refreshReplies(true, false);
                }}
              />
              {replySubmitError && <p style={{ color: "#dc2626" }}>{replySubmitError}</p>}
              {showReplyLoading && <ReplyListSkeleton count={4} />}
              {replyError && <p style={{ color: "#dc2626" }}>{replyError}</p>}
              {!replyLoading && !replyError && (
                <ReplyList
                  postId={postIdNumber}
                  tree={tree}
                  hasMore={hasMoreReplies}
                  loadingMore={replyLoadingMore}
                  onLoadMore={loadMore}
                  currentUserPublicId={user?.publicId}
                  currentUserName={user?.nickname}
                  isAdmin={false}
                  canWrite={isLoggedIn}
                  canDeleteAsAdmin={false}
                  onUpdate={(replyId, content) => update({ postId: postIdNumber, replyId, content }).then(() => refreshReplies(false))}
                  onDelete={(replyId) => remove({ postId: postIdNumber, replyId }).then(() => refreshReplies(false))}
                  onCreateChild={(content, targetReplyId, expandParentId) =>
                    create({
                      postId: postIdNumber,
                      content,
                      parentId: targetReplyId,
                    }).then(async (createdReplyId) => {
                      setAutoExpandParentId(expandParentId);
                      setFocusReplyId(createdReplyId);
                      await refreshReplies(true, false);
                    })
                  }
                  onReact={(replyId) => replyApi.reactToReply(postIdNumber, replyId).then((response) => response.data)}
                  autoExpandParentId={autoExpandParentId}
                  focusReplyId={focusReplyId}
                  onFocusReplyHandled={() => setFocusReplyId(null)}
                  onFocusReply={(replyId, expandParentId) => {
                    if (expandParentId) {
                      setAutoExpandParentId(expandParentId);
                    }
                    setFocusReplyId(replyId);
                  }}
                />
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
