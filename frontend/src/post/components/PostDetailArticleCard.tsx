import type { ReactNode } from "react";
import { Eye, Heart } from "lucide-react";
import PostContent from "./PostContent";
import type { PostResponse } from "../types/postTypes";
import {
  NOTICE_CATEGORY_BADGE_PALETTE,
  NOTICE_CATEGORY_LABEL,
} from "../constants/noticeCategory";
import { formatDate, isEdited } from "../utils/dateFormat";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";
import UserAvatar from "../../common/components/UserAvatar";

interface PostDetailArticleCardProps {
  post: PostResponse;
  contentFooter?: ReactNode;
  actionSection?: ReactNode;
  headerAction?: ReactNode;
  titleTop?: ReactNode;
  minContentHeight?: number;
  contentPadding?: number;
}

export default function PostDetailArticleCard({
  post,
  contentFooter,
  actionSection,
  headerAction,
  titleTop,
  minContentHeight = 380,
  contentPadding = 24,
}: PostDetailArticleCardProps) {
  const edited = isEdited(post.createDate, post.updateDate);
  const noticeCategoryLabel =
    post.noticeCategory != null
      ? NOTICE_CATEGORY_LABEL[post.noticeCategory] ?? "공지"
      : null;
  const noticeCategoryStyle = NOTICE_CATEGORY_BADGE_PALETTE[post.noticeCategory ?? "ANNOUNCEMENT"];

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
      <div style={{ padding: "24px 24px 8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
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
                  backgroundColor: noticeCategoryStyle.backgroundColor,
                  borderColor: noticeCategoryStyle.borderColor,
                  color: noticeCategoryStyle.color,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {noticeCategoryLabel}
              </span>
            )}
            {titleTop}
            <h2
              style={{
                margin: 0,
                fontSize: 26,
                color: "#111827",
                fontWeight: 800,
                lineHeight: 1.35,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {post.title}
            </h2>
            <div className="post-detail-author-block">
              <span className="post-detail-author-avatar-wrap">
                <UserAvatar name={post.authorName} size={40} ariaHidden initialMode="nickname" />
              </span>
              <div className="post-detail-author-info">
                <p className="post-detail-author-name">{post.authorName}</p>
                <span className="community-post-item-meta post-detail-author-meta">
                  <span className="community-post-item-stat">
                    <Heart size={14} />
                    {post.likeCount}
                  </span>
                  <span className="community-post-item-stat">
                    <CommentBubbleIcon size={14} strokeWidth={1.8} />
                    {post.replyCount}
                  </span>
                  <span className="community-post-item-stat">
                    <Eye size={14} />
                    {post.viewCount}
                  </span>
                  <span>
                    {formatDate(post.createDate)}
                    {edited ? " (수정됨)" : ""}
                  </span>
                </span>
              </div>
            </div>
          </div>
          {headerAction && <div style={{ marginLeft: "auto" }}>{headerAction}</div>}
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
