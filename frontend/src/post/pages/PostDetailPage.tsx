import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import BoardTabs from "../../board/components/BoardTabs";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import PostMeta from "../components/PostMeta";
import { usePostDetail } from "../hooks/usePostDetail";
import { useReplies } from "../../reply/hooks/useReplies";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import ReplyList from "../../reply/components/ReplyList";
import ReplyForm from "../../reply/components/ReplyForm";
import { postRoutes } from "../routes/postRoutes";
import type { PostKind } from "../types/postTypes";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = Number(postId);
  const location = useLocation();
  const navigate = useNavigate();
  const kind = resolveKind(location.pathname);

  const { data, loading, error } = usePostDetail({ kind, postId: postIdNumber });
  const { tree, loading: replyLoading, error: replyError, refetch } = useReplies({ postId: postIdNumber });
  const { create } = useReplyForm();

  const backPath = kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
  const editPath = kind === "notice" ? postRoutes.noticeEdit(postIdNumber) : postRoutes.freeEdit(postIdNumber);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <BoardTabs />
        <p style={{ marginTop: 0 }}>
          <Link to={backPath}>목록으로</Link>
        </p>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {data && (
          <>
            <h2>{data.title}</h2>
            <PostMeta post={data} />
            <article style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{data.content}</article>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => navigate(editPath)}>
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
