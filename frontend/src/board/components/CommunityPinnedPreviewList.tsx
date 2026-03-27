import { Link } from "react-router-dom";
import { Pin, Trash2 } from "lucide-react";

export interface PinnedPreviewItem {
  id: number;
  title: string;
  authorName: string;
  createDateLabel: string;
  href: string;
  status?: "pinned" | "deleted";
}

interface CommunityPinnedPreviewListProps {
  items: PinnedPreviewItem[];
  editable?: boolean;
  fromPath?: string;
  onTogglePin?: (postId: number) => void;
  onCancelDelete?: (postId: number) => void;
}

export default function CommunityPinnedPreviewList({
  items,
  editable = false,
  fromPath = "/board",
  onTogglePin,
  onCancelDelete,
}: CommunityPinnedPreviewListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="community-pinned-preview" aria-label="상단 고정 미리보기">
      <ul className="community-pinned-preview-list">
        {items.map((item) => (
          <li key={item.id}>
            {editable ? (
              <div
                className={`community-pinned-preview-card ${
                  item.status === "deleted" ? "is-deleted" : ""
                }`}
              >
                {item.status === "deleted" ? (
                  <button
                    type="button"
                    className="community-pinned-preview-pin-button is-danger"
                    aria-label="삭제 예정 취소"
                    onClick={() => onCancelDelete?.(item.id)}
                  >
                    <Trash2 size={14} strokeWidth={2} className="pin-icon" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="community-pinned-preview-pin-button"
                    aria-label="상단 고정 해제"
                    onClick={() => onTogglePin?.(item.id)}
                  >
                    <Pin size={14} strokeWidth={2} className="pin-icon pinned" />
                  </button>
                )}
                <p className="community-pinned-preview-title">{item.title}</p>
                <time className="community-pinned-preview-date">{item.createDateLabel}</time>
                <span className="community-pinned-preview-author">{item.authorName}</span>
              </div>
            ) : (
              <Link
                to={item.href}
                state={{ from: fromPath }}
                className={`community-pinned-preview-card ${
                  item.status === "deleted" ? "is-deleted" : ""
                }`}
              >
                <span className="community-pinned-preview-pin" aria-hidden="true">
                  <Pin
                    size={14}
                    strokeWidth={2}
                    className={`pin-icon ${item.status === "deleted" ? "" : "pinned"}`}
                  />
                </span>
                <p className="community-pinned-preview-title">{item.title}</p>
                <time className="community-pinned-preview-date">{item.createDateLabel}</time>
                <span className="community-pinned-preview-author">{item.authorName}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
