import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
import type { RootState } from "../../users/reducers/store";

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

  const backPath =
    kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
  const editPath =
    kind === "notice"
      ? postRoutes.noticeEdit(postIdNumber)
      : postRoutes.freeEdit(postIdNumber);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ marginTop: 0 }}>
          <Link to={backPath}>목록으로</Link>
        </p>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {data && (
          <>
            <h2>{data.title}</h2>
            <PostMeta post={data} />
            <article style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
              {data.content}
            </article>
            {canEdit && (
              <div style={{ marginTop: 12 }}>
                <button type="button" onClick={() => navigate(editPath)}>
                  수정
                </button>
              </div>
            )}

            <section style={{ marginTop: 28 }}>
              <h3>댓글</h3>
              {!isLoggedIn && (
                <p style={{ color: "#666" }}>
                  댓글 작성은 로그인 후 가능합니다.
                </p>
              )}
              {canCreateReply && (
                <ReplyForm
                  postId={postIdNumber}
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
