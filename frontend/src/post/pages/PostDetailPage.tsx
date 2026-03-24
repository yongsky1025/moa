import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import {
  BoardDetailSkeleton,
  ReplyListSkeleton,
} from "../../common/components/BoardLoadingSkeletons";
import PostDetailArticleCard from "../components/PostDetailArticleCard";
import PostLikeButton from "../components/PostLikeButton";
import PostActionMenu from "../components/PostActionMenu";
import { usePostDetail } from "../hooks/usePostDetail";
import { useReplies } from "../../reply/hooks/useReplies";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import { replyApi } from "../../reply/api/replyApi";
import ReplyList from "../../reply/components/ReplyList";
import ReplyForm from "../../reply/components/ReplyForm";
import "../../reply/styles/replySection.css";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";
import { postRoutes } from "../routes/postRoutes";
import { postApi } from "../api/postApi";
import type { PostKind, PostReactionSummary } from "../types/postTypes";
import type { RootState } from "../../users/reducers/store";
import { getErrorMessage } from "../../common/utils/errorMessage";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

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

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = Number(postId);
  const location = useLocation();
  const navigate = useNavigate();
  const kind = resolveKind(location.pathname);

  const { data, loading, error } = usePostDetail({
    kind,
    postId: postIdNumber,
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
  } = useReplies({ postId: postIdNumber });
  const { create, update, remove, error: replySubmitError } = useReplyForm();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.userRole === "ADMIN";
  const isOwner = !!data && !!user && data.authorPublicId === user.publicId;
  const canEdit = kind === "notice" ? isAdmin : isOwner;
  const canCreateReply = isLoggedIn;
  const [reactionSummary, setReactionSummary] =
    useState<PostReactionSummary | null>(null);
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

  const backPath =
    kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
  const boardTitle = kind === "notice" ? "공지게시판" : "자유게시판";
  const editPath =
    kind === "notice"
      ? postRoutes.noticeEdit(postIdNumber)
      : postRoutes.freeEdit(postIdNumber);

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
      const response = await postApi.reactToPost(postIdNumber);
      setReactionSummary(response.data);
    } catch (e) {
      setReactionSummary(baseReaction);
      setReactionError(getErrorMessage(e));
    }
  };

  const removePost = async () => {
    if (!data) return;
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      if (kind === "notice") {
        await postApi.deleteNoticePost(data.postId);
      } else {
        await postApi.deleteFreePost(data.postId);
      }
      window.alert("게시글이 삭제되었습니다.");
      navigate(backPath);
    } catch (e) {
      window.alert(getErrorMessage(e));
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader
        title={boardTitle}
        backTo={backPath}
        backLabel="목록으로 이동"
      />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {showPostLoading && <BoardDetailSkeleton />}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {data && (
          <>
            <PostDetailArticleCard
              post={data}
              headerAction={
                <PostActionMenu
                  canEdit={canEdit}
                  canDelete={canEdit}
                  canReport={isLoggedIn && !canEdit}
                  onEdit={() => navigate(editPath)}
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
                    liked={
                      (reactionSummary?.myReaction ?? data.myReaction) ===
                      "LIKE"
                    }
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
              <h3
                className="reply-section-title"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
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
                onSubmitReply={async (content) => {
                  await create({ postId: postIdNumber, content });
                }}
                canWrite={isLoggedIn}
                onSuccess={() => void refreshReplies(true)}
              />
              {replySubmitError && (
                <p style={{ color: "#dc2626" }}>{replySubmitError}</p>
              )}
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
                  isAdmin={!!isAdmin}
                  canWrite={canCreateReply}
                  canDeleteAsAdmin
                  onUpdate={(replyId, content) =>
                    update({ postId: postIdNumber, replyId, content }).then(
                      () => refreshReplies(false),
                    )
                  }
                  onDelete={(replyId) =>
                    remove({ postId: postIdNumber, replyId }).then(() =>
                      refreshReplies(false),
                    )
                  }
                  onCreateChild={(content, targetReplyId, expandParentId) =>
                    create({ postId: postIdNumber, content, parentId: targetReplyId }).then(async (createdReplyId) => {
                      setAutoExpandParentId(expandParentId);
                      setFocusReplyId(createdReplyId);
                      await refreshReplies(true, false);
                    })
                  }
                  onReact={(replyId) =>
                    replyApi.reactToReply(postIdNumber, replyId).then((response) => response.data)
                  }
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

