import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bookmark } from "lucide-react";

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
          isBookmarkAnimating ? "pulse" : ""
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
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 0,
            minWidth: 108,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
            padding: 6,
            display: "grid",
            gap: 4,
            zIndex: 10,
          }}
        >
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              style={menuButtonStyle}
            >
              수정
            </button>
          )}
          {canPin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onTogglePin?.();
              }}
              style={menuButtonStyle}
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
              style={{ ...menuButtonStyle, color: "#b91c1c" }}
            >
              삭제
            </button>
          )}
          {canReport && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onReport?.();
              }}
              style={menuButtonStyle}
            >
              신고
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const menuButtonStyle: CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  borderRadius: 8,
  textAlign: "left",
  padding: "8px 10px",
  color: "#111827",
  fontSize: 14,
  cursor: "pointer",
};
