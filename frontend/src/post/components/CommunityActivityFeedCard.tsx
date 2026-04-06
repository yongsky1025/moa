import {
  Eye,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { RemoveScroll } from "react-remove-scroll";
import type { PostResponse } from "../types/postTypes";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";
import UserAvatar from "../../common/components/UserAvatar";
import { toAssetUrl } from "../../common/utils/assetUrl";

interface CommunityActivityFeedCardProps {
  post: PostResponse;
  circleName: string;
  circleDetailHref?: string;
  postHref: string;
  fromState?: unknown;
  createDateLabel: string;
  disableNavigation?: boolean;
  previewImages?: string[];
  summary: string;
  liked: boolean;
  likeCount: number;
  isLikeAnimating?: boolean;
  reactionError?: string;
  isLoggedIn: boolean;
  avatarColor: string;
  onToggleReaction: () => void;
  headerAction?: ReactNode;
  metaAction?: ReactNode;
}

export default function CommunityActivityFeedCard({
  post,
  circleName,
  circleDetailHref,
  postHref,
  fromState,
  createDateLabel,
  disableNavigation = false,
  previewImages = [],
  summary,
  liked,
  likeCount,
  isLikeAnimating = false,
  reactionError,
  isLoggedIn,
  // avatarColor는 더 이상 사용하지 않음 (아이콘으로 통일)
  onToggleReaction,
  headerAction,
  metaAction,
}: CommunityActivityFeedCardProps) {
  const bodyText = summary;
  const images = previewImages.filter(Boolean).map((url) => toAssetUrl(url));
  const imageCount = images.length;
  const [zoomedImageIdx, setZoomedImageIdx] = useState<number | null>(null);
  const hasZoomImage = zoomedImageIdx !== null && !!images[zoomedImageIdx];

  const openZoomAt = (idx: number) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomedImageIdx(idx);
  };

  const handlePrevImage = () => {
    if (!images.length) return;
    setZoomedImageIdx((prev) => {
      if (prev == null) return 0;
      return (prev - 1 + images.length) % images.length;
    });
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setZoomedImageIdx((prev) => {
      if (prev == null) return 0;
      return (prev + 1) % images.length;
    });
  };

  const openCurrentZoomImageInNewTab = () => {
    if (zoomedImageIdx == null) return;
    const url = images[zoomedImageIdx];
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
  }, [hasZoomImage, images.length]);

  return (
    <article className="community-twitter-card">
      <div className="community-twitter-main">
        <div className="community-twitter-body">
          <div className="community-twitter-header">
            <div className="community-twitter-topline">
              {circleDetailHref ? (
                <Link to={circleDetailHref} className="post-detail-back-link">
                  ← {circleName}
                </Link>
              ) : (
                <span className="post-detail-back-link">← {circleName}</span>
              )}
              {headerAction}
            </div>
            <div className="community-twitter-author-block">
              <span className="community-twitter-author-avatar-wrap">
                <UserAvatar
                  name={post.authorName}
                  size={40}
                  ariaHidden
                  className="community-twitter-avatar"
                  variant="icon"
                  backgroundColor="#5F8F7B"
                />
              </span>
              <div className="community-twitter-author-info">
                <span className="community-twitter-author">{post.authorName}</span>
                <span className="community-post-item-meta community-twitter-author-meta">
                  <span className="community-post-item-stat">
                    <Heart size={14} />
                    {likeCount}
                  </span>
                  <span className="community-post-item-stat">
                    <CommentBubbleIcon size={14} strokeWidth={1.8} />
                    {post.replyCount}
                  </span>
                  <span className="community-post-item-stat">
                    <Eye size={14} />
                    {post.viewCount}
                  </span>
                  <span>{createDateLabel}</span>
                  {metaAction && <span className="community-twitter-meta-action">{metaAction}</span>}
                </span>
              </div>
            </div>
          </div>

          <Link
            to={postHref}
            state={fromState}
            className="community-twitter-content-link"
            onClick={(e) => {
              if (disableNavigation) {
                e.preventDefault();
              }
            }}
        >
          <div className={`community-twitter-content-split ${images.length > 0 ? "has-image" : ""}`}>
            <div className="community-twitter-content-text">
              {bodyText && <p className="community-twitter-text">{bodyText}</p>}
            </div>
            {imageCount === 1 && (
              <div className="community-twitter-media">
                <img
                  src={images[0]}
                  alt=""
                  loading="lazy"
                  style={{ cursor: "pointer" }}
                  onClick={openZoomAt(0)}
                />
              </div>
            )}
            {imageCount === 2 && (
              <div className="community-twitter-album community-twitter-album-2">
                {images.slice(0, 2).map((url, idx) => (
                  <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      style={{ cursor: "pointer" }}
                      onClick={openZoomAt(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
            {imageCount === 3 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img
                    src={images[0]}
                    alt=""
                    loading="lazy"
                    style={{ cursor: "pointer" }}
                    onClick={openZoomAt(0)}
                  />
                </div>
                <div className="community-twitter-album-stack">
                  {images.slice(1, 3).map((url, idx) => (
                    <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        style={{ cursor: "pointer" }}
                        onClick={openZoomAt(idx + 1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {imageCount >= 4 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img
                    src={images[0]}
                    alt=""
                    loading="lazy"
                    style={{ cursor: "pointer" }}
                    onClick={openZoomAt(0)}
                  />
                </div>
                <div className="community-twitter-album-stack three">
                  {images.slice(1, 4).map((url, idx) => {
                    const extraCount = imageCount - 4;
                    const showMore = idx === 2 && extraCount > 0;
                    return (
                      <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          style={{ cursor: "pointer" }}
                          onClick={openZoomAt(idx + 1)}
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
        </Link>

          <div className="community-twitter-footer">
            <div className="community-twitter-actions">
              <div className="community-twitter-actions-left">
                <button
                  className={`community-twitter-like-button ${liked ? "on" : ""} ${isLikeAnimating ? "moa-reaction-pulse" : ""} ${!isLoggedIn ? "disabled" : ""}`}
                  type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleReaction();
                }}
                disabled={!isLoggedIn}
                aria-pressed={liked}
                aria-label={liked ? "좋아요 취소" : "좋아요"}
              >
                  <Heart
                    size={18}
                    strokeWidth={2}
                    fill={liked ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  <span>{likeCount}</span>
                </button>
                <span className="community-twitter-action">
                  <CommentBubbleIcon size={18} strokeWidth={1.8} />
                  <span>{post.replyCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {reactionError && <p className="community-activity-feed-reaction-error">{reactionError}</p>}
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
                {images.length > 1 && (
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
                  src={images[zoomedImageIdx]}
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
                {images.length > 1 && (
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
              {images.length > 1 && (
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    justifyItems: "center",
                    gap: 6,
                    padding: "2px 0 0",
                    borderTop: "1px solid rgba(229,231,235,0.3)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", justifyContent: "center", width: "100%" }}>
                    {images.map((url, idx) => (
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
    </article>
  );
}
