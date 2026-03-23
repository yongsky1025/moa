import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import PostMeta from "../components/PostMeta";
import PostContent from "../components/PostContent";
import { usePostDetail } from "../hooks/usePostDetail";
import { useReplies } from "../../reply/hooks/useReplies";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import ReplyList from "../../reply/components/ReplyList";
import ReplyForm from "../../reply/components/ReplyForm";
import { postRoutes } from "../routes/postRoutes";
import { postApi } from "../api/postApi";
import type {
  PostKind,
  PostReactionSummary,
} from "../types/postTypes";
import type { RootState } from "../../users/reducers/store";
import { getErrorMessage } from "../../common/utils/errorMessage";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

function countReplies(nodes: Array<{ children?: unknown[] }>): number {
  return nodes.reduce((sum, node) => {
    const childrenCount = Array.isArray(node.children) ? node.children.length : 0;
    return sum + 1 + childrenCount;
  }, 0);
}

function applyLocalReaction(
  current: PostReactionSummary,
): PostReactionSummary {
  if (current.myReaction === "LIKE") {
    return { ...current, likeCount: Math.max(0, current.likeCount - 1), myReaction: null };
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
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.userRole === "ADMIN";
  const isOwner = !!data && !!user && data.authorPublicId === user.publicId;
  const canEdit = kind === "notice" ? isAdmin : isOwner;
  const canCreateReply = isLoggedIn;
  const totalReplyCount = countReplies(tree);
  const [reactionSummary, setReactionSummary] = useState<PostReactionSummary | null>(null);
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader title={boardTitle} backTo={backPath} backLabel="목록으로 이동" />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {data && (
          <>
            <section
              style={{
                backgroundColor: "#fff",
                border: "1px solid #d6d9dd",
                borderRadius: 14,
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "28px 28px 24px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 42 / 2,
                    color: "#111827",
                    fontWeight: 800,
                    lineHeight: 1.35,
                  }}
                >
                  {data.title}
                </h2>
                <div style={{ marginTop: 16 }}>
                  <PostMeta post={data} />
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb" }} />

              <div style={{ padding: 28 }}>
                <PostContent html={data.content} />

                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => void react()}
                    disabled={!isLoggedIn}
                    style={{
                      border: "1px solid #d1d5db",
                      backgroundColor:
                        (reactionSummary?.myReaction ?? data.myReaction) === "LIKE"
                          ? "#ecfdf3"
                          : "#fff",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 15,
                      color:
                        (reactionSummary?.myReaction ?? data.myReaction) === "LIKE"
                          ? "#047857"
                          : "#111827",
                      fontWeight: 600,
                      cursor: !isLoggedIn ? "not-allowed" : "pointer",
                      opacity: !isLoggedIn ? 0.6 : 1,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M7 10v10H3V10h4Zm2 10h7.2a2 2 0 0 0 2-1.7l1-6.5A2 2 0 0 0 17.2 9H13l.6-3.2A2.5 2.5 0 0 0 11.2 3L9 7.4V20Z"
                        fill="none"
                        stroke={(reactionSummary?.myReaction ?? data.myReaction) === "LIKE" ? "#047857" : "#6b7280"}
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{reactionSummary?.likeCount ?? data.likeCount}</span>
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => navigate(editPath)}
                      style={{
                        border: "1px solid #d1d5db",
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 15,
                        color: "#111827",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      수정
                    </button>
                  )}
                </div>
                {reactionError && (
                  <p style={{ margin: "10px 0 0", color: "#dc2626" }}>{reactionError}</p>
                )}
              </div>
            </section>

            <section style={{ marginTop: 28 }}>
              <h3
                style={{
                  margin: "0 0 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 32 / 2,
                }}
              >
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
              {!isLoggedIn ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    backgroundColor: "#fff",
                    border: "1px solid #d6d9dd",
                    borderRadius: 14,
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                    padding: 24,
                  }}
                >
                  <p style={{ margin: 0, color: "#6b7280" }}>
                    댓글을 작성하려면 로그인이 필요합니다.
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <textarea
                      rows={3}
                      disabled
                      placeholder="로그인 후 댓글을 작성할 수 있습니다"
                      style={{
                        flex: 1,
                        padding: 14,
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        backgroundColor: "#f9fafb",
                        resize: "none",
                        color: "#9ca3af",
                      }}
                    />
                    <button
                      type="button"
                      disabled
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        backgroundColor: "#9ca3af",
                        color: "#fff",
                        cursor: "not-allowed",
                      }}
                      aria-label="댓글 전송"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 11.5 20.5 4l-7.3 16-2.2-6.3L3 11.5Z"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <ReplyForm
                  postId={postIdNumber}
                  variant="panel"
                  onSubmitReply={async (content) => {
                    await create({ postId: postIdNumber, content });
                  }}
                  onSuccess={() => void refetch()}
                />
              )}
              {replySubmitError && (
                <p style={{ color: "#dc2626" }}>{replySubmitError}</p>
              )}
              {replyLoading && <p>댓글 불러오는 중...</p>}
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


