import {
  Eye,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { PostResponse } from "../types/postTypes";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";

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
  avatarColor,
  onToggleReaction,
  headerAction,
  metaAction,
}: CommunityActivityFeedCardProps) {
  const bodyText = summary;
  const images = previewImages.filter(Boolean);
  const imageCount = images.length;

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
                <span className="community-twitter-avatar" style={{ backgroundColor: avatarColor }}>
                  {post.authorName.charAt(0)}
                </span>
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
                <img src={images[0]} alt="" loading="lazy" />
              </div>
            )}
            {imageCount === 2 && (
              <div className="community-twitter-album community-twitter-album-2">
                {images.slice(0, 2).map((url, idx) => (
                  <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                    <img src={url} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
            {imageCount === 3 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img src={images[0]} alt="" loading="lazy" />
                </div>
                <div className="community-twitter-album-stack">
                  {images.slice(1, 3).map((url, idx) => (
                    <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                      <img src={url} alt="" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {imageCount >= 4 && (
              <div className="community-twitter-album community-twitter-album-side">
                <div className="community-twitter-album-main">
                  <img src={images[0]} alt="" loading="lazy" />
                </div>
                <div className="community-twitter-album-stack three">
                  {images.slice(1, 4).map((url, idx) => {
                    const extraCount = imageCount - 4;
                    const showMore = idx === 2 && extraCount > 0;
                    return (
                      <div key={`${url}-${idx}`} className="community-twitter-album-cell">
                        <img src={url} alt="" loading="lazy" />
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
    </article>
  );
}
