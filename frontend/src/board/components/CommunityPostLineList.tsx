import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import UserAvatar from "../../common/components/UserAvatar";

export interface CommunityPostLineListItem {
  key: string | number;
  href: string;
  linkState?: unknown;
  title: string;
  likeCount?: number;
  replyCount?: number;
  dateText: string;
  authorName: string;
  leftSlot?: ReactNode;
}

interface CommunityPostLineListProps {
  items: CommunityPostLineListItem[];
}

export default function CommunityPostLineList({ items }: CommunityPostLineListProps) {
  return (
    <ul className="community-post-line-list">
      {items.map((item) => (
        <li key={item.key} className="community-post-line-item">
          <Link to={item.href} state={item.linkState} className="community-post-line-link">
            <span className="community-post-line-likes" aria-label={`좋아요 ${item.likeCount ?? 0}`}>
              {item.leftSlot ?? (
                <>
                  <svg
                    className="community-post-like-icon"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 6 6 16h12L12 6Z" fill="currentColor" />
                  </svg>
                  <span>{item.likeCount ?? 0}</span>
                </>
              )}
            </span>
            <p className="community-post-line-title">
              {item.title}
              {(item.replyCount ?? 0) > 0 && (
                <span className="community-post-line-replies">[{item.replyCount}]</span>
              )}
            </p>
            <span className="community-post-line-time">{item.dateText}</span>
            <span className="community-post-line-author">
              <UserAvatar
                name={item.authorName}
                size={20}
                ariaHidden
                className="community-post-author-icon"
                initialMode="nickname"
              />
              <span className="community-post-line-author-name">{item.authorName}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
