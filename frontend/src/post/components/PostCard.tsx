import { Link } from "react-router-dom";
import type { PostResponse } from "../types/postTypes";
import type { PostKind } from "../types/postTypes";
import { postRoutes } from "../routes/postRoutes";

interface PostCardProps {
  post: PostResponse;
  kind: Exclude<PostKind, "circle">;
}

function detailPath(kind: Exclude<PostKind, "circle">, postId: number) {
  if (kind === "notice") return postRoutes.noticeDetail(postId);
  return postRoutes.freeDetail(postId);
}

export default function PostCard({ post, kind }: PostCardProps) {
  return (
    <li style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
      <Link to={detailPath(kind, post.postId)} style={{ textDecoration: "none", color: "#111" }}>
        <div style={{ fontWeight: 700 }}>{post.title}</div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
          {post.authorName} · 조회 {post.viewCount} · 댓글 {post.replyCount}
        </div>
      </Link>
    </li>
  );
}
