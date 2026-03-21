import { Link, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import CircleBoardSideMenu from "../components/CircleBoardSideMenu";
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
  const selectedBoardName =
    boardIdNumber == null
      ? "전체 게시글"
      : (boards ?? []).find((board) => board.boardId === boardIdNumber)?.name ??
        "게시판";

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
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <section
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <h1 style={{ margin: 0 }}>{selectedBoardName}</h1>
              <Link
                to={
                  boardIdNumber !== null
                    ? postRoutes.circleCreate(circleIdNumber, boardIdNumber)
                    : postRoutes.circleCreateAll(circleIdNumber)
                }
              >
                글쓰기
              </Link>
            </div>
            {loading && <p>로딩 중...</p>}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            {!loading && !error && (
              <>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {posts.map((post) => (
                    <li
                      key={post.postId}
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "10px 0",
                      }}
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
          </section>

          <aside style={{ width: "100%", maxWidth: 280, flexShrink: 0 }}>
            <CircleBoardSideMenu
              circleId={circleIdNumber}
              currentBoardId={boardIdNumber ?? undefined}
            />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
