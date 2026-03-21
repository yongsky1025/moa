import { Link, useLocation } from "react-router-dom";
import BoardTabs from "../../board/components/BoardTabs";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import PostList from "../components/PostList";
import { usePosts } from "../hooks/usePosts";
import { postRoutes } from "../routes/postRoutes";
import type { PostKind } from "../types/postTypes";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

export default function PostListPage() {
  const location = useLocation();
  const kind = resolveKind(location.pathname);
  const { data, loading, error } = usePosts({ kind });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ marginTop: 0 }}>게시판</h1>
        <BoardTabs />
        <div style={{ marginBottom: 12 }}>
          <Link to={kind === "notice" ? postRoutes.noticeCreate : postRoutes.freeCreate}>글쓰기</Link>
        </div>

        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {!loading && !error && <PostList posts={data} kind={kind} />}
      </main>
      <Footer />
    </div>
  );
}
