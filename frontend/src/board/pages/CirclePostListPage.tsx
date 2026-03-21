import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import CircleBoardSelector from "../components/CircleBoardSelector";
import CircleBoardPostPreviewSection from "../components/CircleBoardPostPreviewSection";
import { useCircleBoards } from "../hooks/useCircleBoards";
import { useCirclePosts } from "../hooks/useCirclePosts";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { postRoutes } from "../../post/routes/postRoutes";

export default function CirclePostListPage() {
  const { circleId, boardId } = useParams<{
    circleId: string;
    boardId?: string;
  }>();
  const navigate = useNavigate();
  const circleIdNumber = parseRouteNumber(circleId);
  const boardIdNumber = parseRouteNumber(boardId ?? "");
  const hasValidCircleId = circleIdNumber !== null;

  const { data: boards } = useCircleBoards({
    circleId: circleIdNumber ?? 0,
    enabled: hasValidCircleId,
  });
  const {
    data: posts,
    loading,
    error,
  } = useCirclePosts({
    circleId: circleIdNumber ?? 0,
    boardId: boardIdNumber ?? undefined,
    enabled: hasValidCircleId,
  });

  if (!hasValidCircleId) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
        <Navbar />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
          <p style={{ color: "#dc2626" }}>잘못된 circleId 입니다.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <h1>써클 게시글</h1>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <CircleBoardSelector
            boards={boards}
            selectedBoardId={boardIdNumber ?? undefined}
            onChange={(nextBoardId) => {
              const path = nextBoardId
                ? postRoutes.circleBoard(circleIdNumber, nextBoardId)
                : postRoutes.circleAll(circleIdNumber);
              navigate(path);
            }}
          />
          {boardIdNumber && (
            <Link to={postRoutes.circleCreate(circleIdNumber, boardIdNumber)}>
              글쓰기
            </Link>
          )}
        </div>

        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {!loading && !error && (
          <>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {posts.map((post) => (
                <li
                  key={post.postId}
                  style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}
                >
                  <Link
                    to={postRoutes.circleDetail(
                      circleIdNumber,
                      post.boardId,
                      post.postId,
                    )}
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
              {posts.length === 0 && <li>게시글이 없습니다.</li>}
            </ul>
            <CircleBoardPostPreviewSection circleId={circleIdNumber} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
