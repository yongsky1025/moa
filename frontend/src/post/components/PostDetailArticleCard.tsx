import type { ReactNode } from "react";
import PostMeta from "./PostMeta";
import PostContent from "./PostContent";
import type { PostResponse } from "../types/postTypes";

interface PostDetailArticleCardProps {
  post: PostResponse;
  contentFooter?: ReactNode;
  actionSection?: ReactNode;
  headerAction?: ReactNode;
  minContentHeight?: number;
  contentPadding?: number;
}

export default function PostDetailArticleCard({
  post,
  contentFooter,
  actionSection,
  headerAction,
  minContentHeight = 380,
  contentPadding = 24,
}: PostDetailArticleCardProps) {
  return (
    <section
      style={{
        backgroundColor: "#fff",
        border: "1px solid #d6d9dd",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
              color: "#111827",
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            {post.title}
          </h2>
          {headerAction}
        </div>
        <div style={{ marginTop: 16 }}>
          <PostMeta post={post} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb" }} />

      <div style={{ padding: contentPadding, minHeight: minContentHeight }}>
        <PostContent html={post.content} />
        {contentFooter}
      </div>

      {actionSection && (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb" }} />
          <div style={{ padding: "16px 24px" }}>{actionSection}</div>
        </>
      )}
    </section>
  );
}
