import type { PostResponse } from "../types/postTypes";
import { formatDateTime } from "../utils/dateFormat";

interface PostMetaProps {
  post: PostResponse;
}

export default function PostMeta({ post }: PostMetaProps) {
  return (
    <div style={{ fontSize: 13, color: "#666", display: "flex", gap: 12, flexWrap: "wrap" }}>
      <span>작성자: {post.authorName}</span>
      <span>조회수: {post.viewCount}</span>
      <span>댓글: {post.replyCount}</span>
      <span>작성일: {formatDateTime(post.createDate)}</span>
    </div>
  );
}
