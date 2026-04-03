import { useEffect, useState, type ReactNode } from "react";
import { Eye, Heart } from "lucide-react";
import { RemoveScroll } from "react-remove-scroll";
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
  contentHtml?: string;
  activitySummaryText?: string;
  albumImages?: string[];
  hideTitle?: boolean;
  contentFooter?: ReactNode;
  actionSection?: ReactNode;
  headerAction?: ReactNode;
  titleTop?: ReactNode;
  minContentHeight?: number;
  contentPadding?: number;
}

export default function PostDetailArticleCard({
  post,
  contentHtml,
  activitySummaryText = "",
  albumImages = [],
  hideTitle = false,
  contentFooter,
  actionSection,
  headerAction,
  titleTop,
  minContentHeight = 380,
  contentPadding = 24,
}: PostDetailArticleCardProps) {
  const [zoomedImageIdx, setZoomedImageIdx] = useState<number | null>(null);
  const edited = isEdited(post.createDate, post.updateDate);
  const noticeCategoryLabel =
    post.noticeCategory != null
      ? NOTICE_CATEGORY_LABEL[post.noticeCategory] ?? "공지"
      : null;
  const noticeCategoryStyle = NOTICE_CATEGORY_BADGE_PALETTE[post.noticeCategory ?? "ANNOUNCEMENT"];
  const hasZoomImage = zoomedImageIdx !== null && !!albumImages[zoomedImageIdx];

  const handlePrevImage = () => {
    if (!albumImages.length) return;
    setZoomedImageIdx((prev) => {
      if (prev == null) return 0;
      return (prev - 1 + albumImages.length) % albumImages.length;
    });
  };

  const handleNextImage = () => {
    if (!albumImages.length) return;
    setZoomedImageIdx((prev) => {
      if (prev == null) return 0;
      return (prev + 1) % albumImages.length;
    });
  };

  const openCurrentZoomImageInNewTab = () => {
    if (zoomedImageIdx == null) return;
    const url = albumImages[zoomedImageIdx];
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!hasZoomImage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomedImageIdx(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevImage();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextImage();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasZoomImage, albumImages.length]);

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
          <div style={{ display: "grid", gap: hideTitle ? 4 : 10, width: "100%" }}>
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
            {hideTitle ? (
              <div className="community-twitter-topline">
                {titleTop && <div className="post-detail-title-top compact">{titleTop}</div>}
                {headerAction}
              </div>
            ) : (
              <>
                {titleTop && <div className="post-detail-title-top">{titleTop}</div>}
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
              </>
            )}
            <div className={`post-detail-author-block${hideTitle ? " no-title" : ""}`}>
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
          {!hideTitle && headerAction && <div style={{ marginLeft: "auto" }}>{headerAction}</div>}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb" }} />

      <div style={{ padding: contentPadding, minHeight: minContentHeight }}>
        {hideTitle ? (
          <div className={`community-twitter-content-split ${albumImages.length > 0 ? "has-image" : ""}`}>
            <div className="community-twitter-content-text">
              {activitySummaryText && <p className="community-twitter-text">{activitySummaryText}</p>}
            </div>
            {albumImages.length === 1 && (
              <div className="community-twitter-media">
                <img
                  src={albumImages[0]}
                  alt="활동 이미지 1"
                  loading="lazy"
                  style={{ cursor: "pointer" }}
                  onClick={() => setZoomedImageIdx(0)}
                />
              </div>
            )}
            {albumImages.length === 2 && (
              <div className="community-twitter-album community-twitter-album-2">
                {albumImages.slice(0, 2).map((url, idx) => (
                  <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                    <img
                      src={url}
                      alt={`활동 이미지 ${idx + 1}`}
                      loading="lazy"
                      style={{ cursor: "pointer" }}
                      onClick={() => setZoomedImageIdx(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
            {albumImages.length === 3 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img
                    src={albumImages[0]}
                    alt="활동 이미지 1"
                    loading="lazy"
                    style={{ cursor: "pointer" }}
                    onClick={() => setZoomedImageIdx(0)}
                  />
                </div>
                <div className="community-twitter-album-stack">
                  {albumImages.slice(1, 3).map((url, idx) => (
                    <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                      <img
                        src={url}
                        alt={`활동 이미지 ${idx + 2}`}
                        loading="lazy"
                        style={{ cursor: "pointer" }}
                        onClick={() => setZoomedImageIdx(idx + 1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {albumImages.length >= 4 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img
                    src={albumImages[0]}
                    alt="활동 이미지 1"
                    loading="lazy"
                    style={{ cursor: "pointer" }}
                    onClick={() => setZoomedImageIdx(0)}
                  />
                </div>
                <div className="community-twitter-album-stack three">
                  {albumImages.slice(1, 4).map((url, idx) => {
                    const extraCount = albumImages.length - 4;
                    const showMore = idx === 2 && extraCount > 0;
                    return (
                      <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                        <img
                          src={url}
                          alt={`활동 이미지 ${idx + 2}`}
                          loading="lazy"
                          style={{ cursor: "pointer" }}
                          onClick={() => setZoomedImageIdx(idx + 1)}
                        />
                        {showMore && (
                          <span className="community-twitter-album-more">더보기 +{extraCount}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <PostContent html={contentHtml ?? post.content} />
            {albumImages.length > 0 && (
              <div style={{ margin: "0 auto 18px", maxWidth: 760 }}>
                {albumImages.length === 1 && (
                  <div className="community-twitter-media" style={{ width: "100%" }}>
                    <img
                      src={albumImages[0]}
                      alt="활동 이미지 1"
                      loading="lazy"
                      style={{ cursor: "pointer" }}
                      onClick={() => setZoomedImageIdx(0)}
                    />
                  </div>
                )}
                {albumImages.length === 2 && (
                  <div className="community-twitter-album community-twitter-album-2" style={{ width: "100%" }}>
                    {albumImages.slice(0, 2).map((url, idx) => (
                      <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                        <img
                          src={url}
                          alt={`활동 이미지 ${idx + 1}`}
                          loading="lazy"
                          style={{ cursor: "pointer" }}
                          onClick={() => setZoomedImageIdx(idx)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {albumImages.length === 3 && (
                  <div className="community-twitter-album community-twitter-album-side" style={{ width: "100%" }}>
                    <div className="community-twitter-album-main">
                      <img
                        src={albumImages[0]}
                        alt="활동 이미지 1"
                        loading="lazy"
                        style={{ cursor: "pointer" }}
                        onClick={() => setZoomedImageIdx(0)}
                      />
                    </div>
                    <div className="community-twitter-album-stack">
                      {albumImages.slice(1, 3).map((url, idx) => (
                        <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                          <img
                            src={url}
                            alt={`활동 이미지 ${idx + 2}`}
                            loading="lazy"
                            style={{ cursor: "pointer" }}
                            onClick={() => setZoomedImageIdx(idx + 1)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {albumImages.length >= 4 && (
                  <div className="community-twitter-album community-twitter-album-side" style={{ width: "100%" }}>
                    <div className="community-twitter-album-main">
                      <img
                        src={albumImages[0]}
                        alt="활동 이미지 1"
                        loading="lazy"
                        style={{ cursor: "pointer" }}
                        onClick={() => setZoomedImageIdx(0)}
                      />
                    </div>
                    <div className="community-twitter-album-stack three">
                      {albumImages.slice(1, 4).map((url, idx) => {
                        const extraCount = albumImages.length - 4;
                        const showMore = idx === 2 && extraCount > 0;
                        return (
                          <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                            <img
                              src={url}
                              alt={`활동 이미지 ${idx + 2}`}
                              loading="lazy"
                              style={{ cursor: "pointer" }}
                              onClick={() => setZoomedImageIdx(idx + 1)}
                            />
                            {showMore && (
                              <span className="community-twitter-album-more">더보기 +{extraCount}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {contentFooter}
      </div>

      {hasZoomImage && zoomedImageIdx !== null && (
        <RemoveScroll enabled>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="이미지 확대 보기"
            onClick={() => setZoomedImageIdx(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.82)",
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setZoomedImageIdx(null)}
              style={{
                position: "fixed",
                right: "max(18px, env(safe-area-inset-right))",
                top: "max(14px, env(safe-area-inset-top))",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(0,0,0,0.28)",
                color: "#fff",
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
                zIndex: 1300,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "grid",
                gap: 10,
                width: "min(92vw, 1120px)",
                maxHeight: "90vh",
                justifyItems: "center",
                background: "#1f2126",
                borderRadius: 8,
                padding: "18px 18px 14px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  minHeight: "64vh",
                  margin: "0 auto",
                }}
              >
                {albumImages.length > 1 && (
                  <button
                    type="button"
                    aria-label="이전 이미지"
                    onClick={handlePrevImage}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 44,
                      height: 72,
                      border: "none",
                      borderRadius: 6,
                      background: "rgba(0,0,0,0.28)",
                      color: "#fff",
                      fontSize: 46,
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ‹
                  </button>
                )}
                <img
                  src={albumImages[zoomedImageIdx]}
                  alt={`확대 이미지 ${zoomedImageIdx + 1}`}
                  onClick={openCurrentZoomImageInNewTab}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "62vh",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: 4,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                    cursor: "zoom-in",
                  }}
                />
                {albumImages.length > 1 && (
                  <button
                    type="button"
                    aria-label="다음 이미지"
                    onClick={handleNextImage}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 44,
                      height: 72,
                      border: "none",
                      borderRadius: 6,
                      background: "rgba(0,0,0,0.28)",
                      color: "#fff",
                      fontSize: 46,
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ›
                  </button>
                )}
              </div>
              {albumImages.length > 1 && (
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    justifyItems: "center",
                    gap: 6,
                    padding: "2px 0 0",
                  }}
                >
                  <p style={{ margin: 0, color: "#e5e7eb", fontSize: 13 }}>
                    {zoomedImageIdx + 1} / {albumImages.length}
                  </p>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      justifyContent: "center",
                    }}
                  >
                    {albumImages.map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        aria-label={`이미지 ${idx + 1} 보기`}
                        onClick={() => setZoomedImageIdx(idx)}
                        style={{
                          border: idx === zoomedImageIdx ? "2px solid #fff" : "2px solid transparent",
                          borderRadius: 8,
                          padding: 0,
                          background: "transparent",
                          cursor: "pointer",
                          flex: "0 0 auto",
                        }}
                      >
                        <img
                          src={url}
                          alt={`썸네일 ${idx + 1}`}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            display: "block",
                            borderRadius: 6,
                            opacity: idx === zoomedImageIdx ? 1 : 0.72,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </RemoveScroll>
      )}

      {actionSection && (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb" }} />
          <div style={{ padding: "16px 24px" }}>{actionSection}</div>
        </>
      )}
    </section>
  );
}

