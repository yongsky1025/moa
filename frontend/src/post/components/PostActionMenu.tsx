import { useEffect, useRef, useState } from "react";
import { Bookmark, Flag, Pencil, Trash2 } from "lucide-react";

interface PostActionMenuProps {
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
  canPin?: boolean;
  pinned?: boolean;
  bookmarked: boolean;
  onTogglePin?: () => void;
  onToggleBookmark?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export default function PostActionMenu({
  canEdit,
  canDelete,
  canReport,
  canPin = false,
  pinned = false,
  bookmarked,
  onTogglePin,
  onToggleBookmark,
  onEdit,
  onDelete,
  onReport,
}: PostActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);
  const bookmarkAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRootRef = useRef<HTMLDivElement | null>(null);
  const canOpenMenu = canPin || canEdit || canDelete || canReport;

  useEffect(() => {
    return () => {
      if (bookmarkAnimationResetRef.current) {
        clearTimeout(bookmarkAnimationResetRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;
      if (targetNode && menuRootRef.current?.contains(targetNode)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleBookmarkClick = () => {
    setIsBookmarkAnimating(false);
    requestAnimationFrame(() => setIsBookmarkAnimating(true));
    if (bookmarkAnimationResetRef.current) {
      clearTimeout(bookmarkAnimationResetRef.current);
    }
    bookmarkAnimationResetRef.current = setTimeout(() => {
      setIsBookmarkAnimating(false);
    }, 500);
    onToggleBookmark?.();
  };

  return (
    <div
      ref={menuRootRef}
      style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", gap: 14 }}
    >
      <button
        type="button"
        aria-label="북마크"
        onClick={handleBookmarkClick}
        className={`post-detail-bookmark-button ${bookmarked ? "on" : ""} ${
          isBookmarkAnimating ? "moa-reaction-pulse" : ""
        }`}
      >
        <Bookmark
          size={18}
          strokeWidth={1.9}
          fill={bookmarked ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
      {canOpenMenu && (
        <button
          type="button"
          aria-label="더보기"
          onClick={() => setOpen((prev) => !prev)}
          className="post-detail-more-button"
        >
          ⋯
        </button>
      )}
      {canOpenMenu && open && (
        <div className="moa-dropdown-menu">
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              className="moa-dropdown-item"
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                수정
              </span>
            </button>
          )}
          {canPin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onTogglePin?.();
              }}
              className="moa-dropdown-item"
            >
              {pinned ? "상단 고정 해제" : "상단 고정"}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
              className="moa-dropdown-item moa-dropdown-item-danger"
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                삭제
              </span>
            </button>
          )}
          {canReport && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onReport?.();
              }}
              className="moa-dropdown-item"
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Flag size={14} strokeWidth={2} aria-hidden="true" />
                신고
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
