import type { PostResponse } from "../types/postTypes";
import { formatDate, isEdited } from "../utils/dateFormat";
import UserAvatar from "../../common/components/UserAvatar";

interface PostMetaProps {
  post: PostResponse;
}

export default function PostMeta({ post }: PostMetaProps) {
  const edited = isEdited(post.createDate, post.updateDate);
  const metaText = `${post.authorName} · ${formatDate(post.createDate)}${edited ? " (수정됨)" : ""} · 조회 ${post.viewCount}`;

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
      <UserAvatar name={post.authorName} size={36} ariaHidden initialMode="nickname" />
      <span
        style={{
          fontSize: 15,
          color: "#4b5563",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {metaText}
      </span>
    </div>
  );
}
