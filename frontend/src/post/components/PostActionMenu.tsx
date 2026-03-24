import { useState, type CSSProperties } from "react";

interface PostActionMenuProps {
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export default function PostActionMenu({
  canEdit,
  canDelete,
  canReport,
  onEdit,
  onDelete,
  onReport,
}: PostActionMenuProps) {
  const [open, setOpen] = useState(false);

  if (!canEdit && !canDelete && !canReport) {
    return null;
  }

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        aria-label="더보기"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#fff",
          fontSize: 20,
          lineHeight: 1,
          color: "#374151",
          cursor: "pointer",
        }}
      >
        ⋯
      </button>
      {open && (
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
