import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import PostList from "../components/PostList";
import { usePosts } from "../hooks/usePosts";
import { postRoutes } from "../routes/postRoutes";
import type { PostKind } from "../types/postTypes";
import type { RootState } from "../../users/reducers/store";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

export default function PostListPage() {
  const location = useLocation();
  const kind = resolveKind(location.pathname);
  const boardTitle = kind === "notice" ? "공지게시판" : "자유게시판";
  const { data, loading, error } = usePosts({ kind });
  const [searchKeyword, setSearchKeyword] = useState("");
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.userRole === "ADMIN";
  const canCreate = kind === "notice" ? isAdmin : isLoggedIn;
  const searchPlaceholder =
    kind === "notice" ? "공지사항 검색..." : "자유게시판 검색...";
  const filteredPosts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return data;

    return data.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const content = post.content?.toLowerCase() ?? "";
      const author = post.authorName?.toLowerCase() ?? "";
      return (
        title.includes(keyword) ||
        content.includes(keyword) ||
        author.includes(keyword)
      );
    });
  }, [data, searchKeyword]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader
        title={boardTitle}
        subtitle="커뮤니티에서 다양한 이야기를 나눠보세요"
        action={
          canCreate ? (
            <Link
              to={
                kind === "notice"
                  ? postRoutes.noticeCreate
                  : postRoutes.freeCreate
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
                fontSize: 18 / 1.2,
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
          ) : undefined
        }
      />
      <section style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
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
              placeholder={searchPlaceholder}
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
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {!loading && !error && (
          kind === "notice" ? (
            <section
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "6px 14px",
              }}
            >
              <PostList posts={filteredPosts} kind={kind} />
            </section>
          ) : (
            <PostList posts={filteredPosts} kind={kind} />
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
