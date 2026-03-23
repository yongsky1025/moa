import { Link } from "react-router-dom";
import { Eye, MessageCircle } from "lucide-react";
import type { PostResponse } from "../../post/types/postTypes";
import { postRoutes } from "../../post/routes/postRoutes";
import { formatDateTime } from "../../post/utils/dateFormat";

interface BoardPreviewPostListProps {
  circleId: number;
  boardId: number;
  boardName: string;
  posts: PostResponse[];
}

export default function BoardPreviewPostList({ circleId, boardId, boardName, posts }: BoardPreviewPostListProps) {
  if (posts.length === 0) {
    return <p style={{ color: "#888", margin: "8px 0 0" }}>게시글이 없습니다.</p>;
  }

  return (
    <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gap: 14 }}>
      {posts.map((post) => (
        <li key={post.postId} style={{ borderBottom: "1px solid #f1f1f1", paddingBottom: 12 }}>
          <Link to={postRoutes.circleDetail(circleId, boardId, post.postId)} style={{ color: "#222", textDecoration: "none", display: "block" }}>
            <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</div>
          </Link>
          <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
            {post.authorName} · {formatDateTime(post.createDate)} · {boardName}
          </div>
          <div style={{ fontSize: 12, color: "#8a8a8a", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Eye size={13} />
              {post.viewCount}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MessageCircle size={13} />
              {post.replyCount}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
