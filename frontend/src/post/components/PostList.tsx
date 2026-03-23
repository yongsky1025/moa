import type { PostResponse } from "../types/postTypes";
import type { PostKind } from "../types/postTypes";
import PostCard from "./PostCard";

interface PostListProps {
  posts: PostResponse[];
  kind: Exclude<PostKind, "circle">;
}

export default function PostList({ posts, kind }: PostListProps) {
  if (posts.length === 0) {
    return <p style={{ color: "#666" }}>게시글이 없습니다.</p>;
  }

  const listStyle =
    kind === "notice"
      ? { listStyle: "none", margin: 0, padding: 0 }
      : { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 };

  return (
    <ul style={listStyle}>
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} kind={kind} />
      ))}
    </ul>
  );
}
