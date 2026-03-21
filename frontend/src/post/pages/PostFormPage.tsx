import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import BoardTabs from "../../board/components/BoardTabs";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import PostForm from "../components/PostForm";
import { usePostDetail } from "../hooks/usePostDetail";
import { usePostForm } from "../hooks/usePostForm";
import { postRoutes } from "../routes/postRoutes";
import type { PostKind } from "../types/postTypes";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

export default function PostFormPage() {
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = Number(postId);
  const location = useLocation();
  const navigate = useNavigate();
  const kind = resolveKind(location.pathname);
  const isEdit = location.pathname.endsWith("/edit");

  const { data, loading: detailLoading, error: detailError } = usePostDetail({
    kind,
    postId: postIdNumber,
    enabled: isEdit && !Number.isNaN(postIdNumber),
  });
  const { submitting, error, submit } = usePostForm();

  useEffect(() => {
    if (!isEdit) return;
    if (postId && Number.isNaN(postIdNumber)) {
      navigate(kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase, { replace: true });
    }
  }, [isEdit, postId, postIdNumber, kind, navigate]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <BoardTabs />
        <h2>{isEdit ? "게시글 수정" : "게시글 작성"}</h2>
        <p>
          <Link to={kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase}>목록으로</Link>
        </p>

        {isEdit && detailLoading && <p>기존 글을 불러오는 중...</p>}
        {isEdit && detailError && <p style={{ color: "#dc2626" }}>{detailError}</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {(!isEdit || data) && (
          <PostForm
            mode={isEdit ? "edit" : "create"}
            initialValue={data ? { title: data.title, content: data.content } : undefined}
            submitting={submitting}
            onSubmit={async (values) => {
              const savedPostId = await submit({
                kind,
                values,
                postId: isEdit ? postIdNumber : undefined,
              });
              const detailPath = kind === "notice" ? postRoutes.noticeDetail(savedPostId) : postRoutes.freeDetail(savedPostId);
              navigate(detailPath);
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
