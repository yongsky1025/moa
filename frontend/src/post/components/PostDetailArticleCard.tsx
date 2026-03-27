import type { ReactNode } from "react";
import PostMeta from "./PostMeta";
import PostContent from "./PostContent";
import type { PostResponse } from "../types/postTypes";
import { NOTICE_CATEGORY_LABEL } from "../constants/noticeCategory";

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
  const noticeCategoryLabel =
    post.noticeCategory != null
      ? NOTICE_CATEGORY_LABEL[post.noticeCategory] ?? "공지"
      : null;

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
          <div style={{ display: "grid", gap: 10 }}>
            {noticeCategoryLabel && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "fit-content",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #cfd8e3",
                  backgroundColor: "#f8fbff",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {noticeCategoryLabel}
              </span>
            )}
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
          </div>
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
