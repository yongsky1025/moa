import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
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
import ReplyList from "../../reply/components/ReplyList";
import ReplyForm from "../../reply/components/ReplyForm";
import "../../reply/styles/replySection.css";
import { postRoutes } from "../routes/postRoutes";
import { postApi } from "../api/postApi";
import type { PostKind, PostReactionSummary } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

function countReplies(nodes: Array<{ children?: unknown[] }>): number {
  return nodes.reduce((sum, node) => {
    const childrenCount = Array.isArray(node.children)
      ? node.children.length
      : 0;
    return sum + 1 + childrenCount;
  }, 0);
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
    error: replyError,
    refetch,
  } = useReplies({ postId: postIdNumber });
  const { create, update, remove, error: replySubmitError } = useReplyForm();
  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const isOwner = !!data && !!user && data.authorPublicId === user.publicId;
  const canEdit = kind === "notice" ? isAdmin : isOwner;
  const canCreateReply = isLoggedIn;
  const totalReplyCount = countReplies(tree);
  const [reactionSummary, setReactionSummary] =
    useState<PostReactionSummary | null>(null);
  const [reactionError, setReactionError] = useState("");

  useEffect(() => {
    setReactionSummary(null);
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
        {loading && <BoardDetailSkeleton />}
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
              {!isLoggedIn ? (
                <div className="reply-login-cta">
                  <p className="reply-login-title">댓글을 작성하려면 로그인이 필요합니다.</p>
                  <p className="reply-login-desc">로그인 후 의견을 남기고 대화에 참여해 보세요.</p>
                  <button
                    type="button"
                    className="reply-login-btn"
                    onClick={() => navigate("/users/login")}
                  >
                    로그인하고 댓글 쓰기
                  </button>
                </div>
              ) : (
                <ReplyForm
                  postId={postIdNumber}
                  variant="panel"
                  currentUserName={user?.nickname}
                  onSubmitReply={async (content) => {
                    await create({ postId: postIdNumber, content });
                  }}
                  onSuccess={() => void refetch()}
                />
              )}
              {replySubmitError && (
                <p style={{ color: "#dc2626" }}>{replySubmitError}</p>
              )}
              {replyLoading && <ReplyListSkeleton count={4} />}
              {replyError && <p style={{ color: "#dc2626" }}>{replyError}</p>}
              {!replyLoading && !replyError && (
                <ReplyList
                  postId={postIdNumber}
                  tree={tree}
                  currentUserPublicId={user?.publicId}
                  isAdmin={!!isAdmin}
                  canWrite={canCreateReply}
                  canDeleteAsAdmin
                  onUpdate={(replyId, content) =>
                    update({ postId: postIdNumber, replyId, content }).then(
                      () => refetch(),
                    )
                  }
                  onDelete={(replyId) =>
                    remove({ postId: postIdNumber, replyId }).then(() =>
                      refetch(),
                    )
                  }
                  onCreateChild={(content, parentId) =>
                    create({ postId: postIdNumber, content, parentId }).then(
                      () => refetch(),
                    )
                  }
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
