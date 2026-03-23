import type { PostResponse } from "../types/postTypes";
import { formatDate } from "../utils/dateFormat";
import { Eye } from "lucide-react";

interface PostMetaProps {
  post: PostResponse;
}

export default function PostMeta({ post }: PostMetaProps) {
  const authorInitial = post.authorName?.trim().charAt(0) || "?";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "#4b5563",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#eef2f7",
          color: "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {authorInitial}
      </div>
      <span style={{ fontSize: 18, color: "#111827", fontWeight: 600 }}>
        {post.authorName}
      </span>
      <span style={{ fontSize: 15, color: "#6b7280" }}>
        {formatDate(post.createDate)}
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 15,
          color: "#6b7280",
        }}
      >
        <Eye size={14} />
        {post.viewCount}
      </span>
    </div>
  );
}
