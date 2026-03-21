import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import PostForm from "../../post/components/PostForm";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { usePostDetail } from "../../post/hooks/usePostDetail";
import { usePostForm } from "../../post/hooks/usePostForm";
import { postRoutes } from "../../post/routes/postRoutes";

export default function CirclePostFormPage() {
  const { circleId, boardId, postId } = useParams<{ circleId: string; boardId: string; postId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location.pathname.endsWith("/edit");

  const circleIdNumber = parseRouteNumber(circleId);
  const boardIdNumber = parseRouteNumber(boardId);
  const postIdNumber = parseRouteNumber(postId ?? "");
  const hasValidParams = circleIdNumber !== null && boardIdNumber !== null && (!isEdit || postIdNumber !== null);

  const { data, loading: detailLoading, error: detailError } = usePostDetail({
    kind: "circle",
    circleId: circleIdNumber ?? 0,
    boardId: boardIdNumber ?? 0,
    postId: postIdNumber ?? 0,
    enabled: hasValidParams && isEdit,
  });
  const { submitting, error, submit } = usePostForm();

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
        <h2>{isEdit ? "써클 게시글 수정" : "써클 게시글 작성"}</h2>
        <p>
          <Link to={postRoutes.circleBoard(circleIdNumber, boardIdNumber)}>목록으로</Link>
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
                kind: "circle",
                values,
                circleId: circleIdNumber,
                boardId: boardIdNumber,
                postId: isEdit ? postIdNumber ?? undefined : undefined,
              });
              navigate(postRoutes.circleDetail(circleIdNumber, boardIdNumber, savedPostId));
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
