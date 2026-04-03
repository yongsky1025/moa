import { Link } from "react-router-dom";
import { Eye, Heart } from "lucide-react";
import type { ReactNode } from "react";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";

export interface BoardPostListItem {
  postId: number;
  href: string;
  linkState?: unknown;
  title: string;
  boardName?: string;
  authorName: string;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  createDate: string;
}

interface BoardPostListProps {
  items: BoardPostListItem[];
  disabledLinks?: boolean;
  isDeleted?: (postId: number) => boolean;
  onPreventNavigate?: () => void;
  dateLabel: (value: string) => string;
  renderLeading?: (item: BoardPostListItem) => ReactNode;
  renderTitleAddon?: (item: BoardPostListItem) => ReactNode;
  showBoardName?: boolean;
  boardNameFormatter?: (boardName: string) => string;
  hideLikeCount?: (item: BoardPostListItem) => boolean;
  renderAdminActions?: (item: BoardPostListItem) => ReactNode;
}

export default function BoardPostList({
  items,
  disabledLinks = false,
  isDeleted,
  onPreventNavigate,
  dateLabel,
  renderLeading,
  renderTitleAddon,
  showBoardName = false,
  boardNameFormatter,
  hideLikeCount,
  renderAdminActions,
}: BoardPostListProps) {
  return (
    <ul className="community-post-list">
      {items.map((item) => {
        const deleted = isDeleted?.(item.postId) ?? false;
        const adminActions = renderAdminActions?.(item);
        const hasAdminActions = !!adminActions;
        const boardDisplayName = item.boardName
          ? boardNameFormatter?.(item.boardName) ?? item.boardName
          : "";

        return (
          <li
            key={item.postId}
            style={deleted ? { opacity: 0.45, filter: "grayscale(0.15)" } : undefined}
          >
            <div className="community-post-item-row">
              <Link
                to={item.href}
                state={item.linkState}
                className={`community-post-item-link ${
                  hasAdminActions ? "has-admin-actions" : ""
                } ${disabledLinks ? "is-disabled" : ""}`}
                onClick={(e) => {
                  if (!disabledLinks) return;
                  e.preventDefault();
                  onPreventNavigate?.();
                }}
              >
                {renderLeading?.(item)}
                <div className="community-post-item-body">
                  <p className="community-post-item-title">
                    <span className="community-post-item-title-text">{item.title}</span>
                    {renderTitleAddon?.(item)}
                    {showBoardName && boardDisplayName ? (
                      <span className="community-post-item-board">· {boardDisplayName}</span>
                    ) : null}
                  </p>
                  <p className="community-post-item-meta">
                    <span>{item.authorName}</span>
                    <span className="community-post-item-stat">
                      <Eye size={14} />
                      {item.viewCount}
                    </span>
                    <span className="community-post-item-stat">
                      <CommentBubbleIcon size={14} strokeWidth={1.8} />
                      {item.replyCount}
                    </span>
                    {!hideLikeCount?.(item) && (
                      <span className="community-post-item-stat">
                        <Heart size={14} />
                        {item.likeCount}
                      </span>
                    )}
                    <span>{dateLabel(item.createDate)}</span>
                  </p>
                </div>
              </Link>
              {adminActions}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
