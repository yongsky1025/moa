import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import PostMeta from "../../post/components/PostMeta";
import PostContent from "../../post/components/PostContent";
import { usePostDetail } from "../../post/hooks/usePostDetail";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { postRoutes } from "../../post/routes/postRoutes";
import { useReplies } from "../../reply/hooks/useReplies";
import ReplyForm from "../../reply/components/ReplyForm";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import ReplyList from "../../reply/components/ReplyList";
import { useSelector } from "react-redux";
import type { RootState } from "../../users/reducers/store";

function countReplies(nodes: Array<{ children?: unknown[] }>): number {
  return nodes.reduce((sum, node) => {
    const childrenCount = Array.isArray(node.children) ? node.children.length : 0;
    return sum + 1 + childrenCount;
  }, 0);
}

export default function CirclePostDetailPage() {
  const { circleId, boardId, postId } = useParams<{ circleId: string; boardId: string; postId: string }>();
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
  const { tree, loading: replyLoading, error: replyError, refetch } = useReplies({
    postId: postIdNumber ?? 0,
    enabled: hasValidParams,
  });
  const { create, update, remove, error: replySubmitError } = useReplyForm();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const isOwner = !!data && !!user && data.authorPublicId === user.publicId;
  const totalReplyCount = countReplies(tree);

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
      <BoardSectionHeader
        title="서클 게시판"
        backTo={postRoutes.circleBoard(circleIdNumber, boardIdNumber)}
        backLabel="목록으로 이동"
      />
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
                  <span
                    style={{
                      border: "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 15,
                      color: "#111827",
                      fontWeight: 600,
                    }}
                  >
                    댓글 {data.replyCount}
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => navigate(postRoutes.circleEdit(circleIdNumber, boardIdNumber, postIdNumber))}
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
              {replySubmitError && <p style={{ color: "#dc2626" }}>{replySubmitError}</p>}
              {replyLoading && <p>댓글 불러오는 중...</p>}
              {replyError && <p style={{ color: "#dc2626" }}>{replyError}</p>}
              {!replyLoading && !replyError && (
                <ReplyList
                  postId={postIdNumber}
                  tree={tree}
                  currentUserPublicId={user?.publicId}
                  isAdmin={false}
                  canWrite={isLoggedIn}
                  canDeleteAsAdmin={false}
                  onUpdate={(replyId, content) => update({ postId: postIdNumber, replyId, content }).then(() => refetch())}
                  onDelete={(replyId) => remove({ postId: postIdNumber, replyId }).then(() => refetch())}
                  onCreateChild={(content, parentId) => create({ postId: postIdNumber, content, parentId }).then(() => refetch())}
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


