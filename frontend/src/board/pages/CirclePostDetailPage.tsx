import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import PostMeta from "../../post/components/PostMeta";
import { usePostDetail } from "../../post/hooks/usePostDetail";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { postRoutes } from "../../post/routes/postRoutes";
import { useReplies } from "../../reply/hooks/useReplies";
import ReplyForm from "../../reply/components/ReplyForm";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import ReplyList from "../../reply/components/ReplyList";

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
  const { create } = useReplyForm();

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
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ marginTop: 0 }}>
          <Link to={postRoutes.circleBoard(circleIdNumber, boardIdNumber)}>목록으로</Link>
        </p>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {data && (
          <>
            <h2>{data.title}</h2>
            <PostMeta post={data} />
            <article style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{data.content}</article>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => navigate(postRoutes.circleEdit(circleIdNumber, boardIdNumber, postIdNumber))}>
                수정
              </button>
            </div>

            <section style={{ marginTop: 28 }}>
              <h3>댓글</h3>
              <ReplyForm
                postId={postIdNumber}
                onSubmitReply={async (content) => {
                  await create({ postId: postIdNumber, content });
                }}
                onSuccess={() => void refetch()}
              />
              {replyLoading && <p>댓글 불러오는 중...</p>}
              {replyError && <p style={{ color: "#dc2626" }}>{replyError}</p>}
              {!replyLoading && !replyError && (
                <ReplyList
                  postId={postIdNumber}
                  tree={tree}
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
