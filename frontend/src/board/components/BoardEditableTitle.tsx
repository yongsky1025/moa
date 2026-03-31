import { Check, Pencil, Trash2, X } from "lucide-react";

interface BoardEditableTitleProps {
  title: string;
  editable: boolean;
  editing: boolean;
  draft: string;
  busy?: boolean;
  maxLength?: number;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function BoardEditableTitle({
  title,
  editable,
  editing,
  draft,
  busy = false,
  maxLength = 20,
  onDraftChange,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: BoardEditableTitleProps) {
  if (editable && editing) {
    return (
      <div className="community-title-inline-edit">
        <input
          className="community-title-inline-input"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave();
            }
            if (e.key === "Escape") {
              onCancel();
            }
          }}
          autoFocus
          maxLength={maxLength}
        />
        <button
          type="button"
          className="community-title-icon-button"
          onClick={onSave}
          disabled={busy}
          aria-label="게시판 이름 저장"
          title="저장"
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          className="community-title-icon-button"
          onClick={onCancel}
          disabled={busy}
          aria-label="수정 취소"
          title="취소"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>
        {title}
      </h3>
      {editable && (
        <span style={{ display: "inline-flex", gap: 6 }}>
          <button
            type="button"
            className="community-title-icon-button"
            onClick={onStartEdit}
            disabled={busy}
            aria-label="게시판 이름 수정"
            title="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="community-title-icon-button danger"
            onClick={onDelete}
            disabled={busy}
            aria-label="게시판 삭제"
            title="삭제"
          >
            <Trash2 size={14} />
          </button>
        </span>
      )}
    </>
  );
}
