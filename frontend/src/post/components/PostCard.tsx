import { Link } from "react-router-dom";
import type { PostResponse } from "../types/postTypes";
import type { PostKind } from "../types/postTypes";
import { postRoutes } from "../routes/postRoutes";
import { formatDate } from "../utils/dateFormat";

interface PostCardProps {
  post: PostResponse;
  kind: Exclude<PostKind, "circle">;
}

function detailPath(kind: Exclude<PostKind, "circle">, postId: number) {
  if (kind === "notice") return postRoutes.noticeDetail(postId);
  return postRoutes.freeDetail(postId);
}

export default function PostCard({ post, kind }: PostCardProps) {
  const plainContent = post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (kind === "notice") {
    return (
      <li style={{ borderBottom: "1px solid #eceff3" }}>
        <Link
          to={detailPath(kind, post.postId)}
          style={{
            textDecoration: "none",
            color: "#111827",
            display: "grid",
            gridTemplateColumns: "84px 1fr 120px",
            alignItems: "start",
            gap: 10,
            padding: "14px 8px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 66,
              height: 28,
              borderRadius: 999,
              border: "1px solid #cfd8e3",
              backgroundColor: "#f8fbff",
              color: "#1d4ed8",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            공지
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginTop: 8,
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {plainContent || "본문이 없습니다."}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {post.authorName} · 조회 {post.viewCount} · 댓글 {post.replyCount}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
            {formatDate(post.createDate)}
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        backgroundColor: "#fff",
        padding: 14,
      }}
    >
      <Link
        to={detailPath(kind, post.postId)}
        style={{ textDecoration: "none", color: "#111827", display: "block" }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            lineHeight: 1.4,
            marginBottom: 6,
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            color: "#4b5563",
            fontSize: 14,
            lineHeight: 1.55,
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {plainContent || "본문이 없습니다."}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {post.authorName} · {formatDate(post.createDate)} · 조회 {post.viewCount} · 댓글 {post.replyCount}
        </div>
      </Link>
    </li>
  );
}
