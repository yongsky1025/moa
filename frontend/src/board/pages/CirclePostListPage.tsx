import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import { BoardListSkeleton } from "../../common/components/BoardLoadingSkeletons";
import CircleBoardSideMenu from "../components/CircleBoardSideMenu";
import { useCircleBoards } from "../hooks/useCircleBoards";
import { useCirclePosts } from "../hooks/useCirclePosts";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { postRoutes } from "../../post/routes/postRoutes";
import { formatDate } from "../../post/utils/dateFormat";

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
      : ((boards ?? []).find((board) => board.boardId === boardIdNumber)
          ?.name ?? "게시판");
  const [searchKeyword, setSearchKeyword] = useState("");
  const filteredPosts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const content = post.content?.toLowerCase() ?? "";
      const author = post.authorName?.toLowerCase() ?? "";
      return (
        title.includes(keyword) ||
        content.includes(keyword) ||
        author.includes(keyword)
      );
    });
  }, [posts, searchKeyword]);

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
      <BoardSectionHeader
        title={selectedBoardName}
        subtitle="모임 커뮤니티 게시글을 확인해보세요"
        action={
          <Link
            to={
              boardIdNumber !== null
                ? postRoutes.circleCreate(circleIdNumber, boardIdNumber)
                : postRoutes.circleCreateAll(circleIdNumber)
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 14px",
              borderRadius: 8,
              backgroundColor: "#111827",
              color: "#fff",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            글쓰기
          </Link>
        }
      />
      <section style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: 10,
              padding: "0 14px",
              height: 48,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m21 21-4.2-4.2m1.7-5.1a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                fill="none"
                stroke="#6b7280"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={`${selectedBoardName} 검색...`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                fontSize: 16,
                color: "#111827",
                backgroundColor: "transparent",
              }}
            />
          </div>
        </div>
      </section>
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
            {loading && <BoardListSkeleton count={6} />}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            {!loading && !error && (
              <>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
                  {filteredPosts.map((post) => (
                    <li
                      key={post.postId}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        backgroundColor: "#fff",
                        padding: 16,
                      }}
                    >
                      <Link
                        to={postRoutes.circleDetail(
                          circleIdNumber,
                          post.boardId,
                          post.postId,
                        )}
                        style={{
                          textDecoration: "none",
                          color: "#111827",
                          display: "block",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: 999,
                              backgroundColor: "#f3f4f6",
                              color: "#374151",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {selectedBoardName}
                          </span>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>
                            {formatDate(post.createDate)}
                          </span>
                        </div>
                        <h3 style={{ margin: "10px 0 6px", fontSize: 19, lineHeight: 1.35 }}>
                          {post.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            color: "#4b5563",
                            fontSize: 14,
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.content.replace(/<[^>]*>/g, " ") || "본문이 없습니다."}
                        </p>
                        <div
                          style={{
                            marginTop: 10,
                            paddingTop: 10,
                            borderTop: "1px solid #f0f2f5",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: 13, color: "#6b7280" }}>
                            {post.authorName} · 조회 {post.viewCount} · 댓글 {post.replyCount}
                          </span>
                          <span
                            style={{
                              padding: "7px 14px",
                              borderRadius: 999,
                              backgroundColor: "#111827",
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            자세히 보기
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {filteredPosts.length === 0 && <li>게시글이 없습니다.</li>}
                </ul>
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
