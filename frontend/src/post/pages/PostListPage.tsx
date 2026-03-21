import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
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
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.userRole === "ADMIN";
  const canCreate = kind === "notice" ? isAdmin : isLoggedIn;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ marginTop: 0 }}>{boardTitle}</h1>
        {canCreate && (
          <div style={{ marginBottom: 12 }}>
            <Link
              to={
                kind === "notice"
                  ? postRoutes.noticeCreate
                  : postRoutes.freeCreate
              }
            >
              글쓰기
            </Link>
          </div>
        )}

        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {!loading && !error && <PostList posts={data} kind={kind} />}
      </main>
      <Footer />
    </div>
  );
}
