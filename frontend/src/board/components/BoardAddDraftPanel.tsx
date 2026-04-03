import { useState } from "react";

interface BoardAddDraftPanelProps {
  enabled: boolean;
  busy?: boolean;
  placeholder?: string;
  addButtonLabel?: string;
  onAdd?: (name: string) => void | Promise<void>;
}

export default function BoardAddDraftPanel({
  enabled,
  busy = false,
  placeholder = "게시판 이름 입력",
  addButtonLabel = "+ 게시판 추가",
  onAdd,
}: BoardAddDraftPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  if (!enabled) {
    return null;
  }

  if (!isAdding) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => setIsAdding(true)}
        style={{
          width: "100%",
          border: "1px dashed #d1d5db",
          color: "#4b5563",
          fontSize: 13,
          fontWeight: 700,
          borderRadius: 8,
          padding: "10px 12px",
          textAlign: "left",
          cursor: "pointer",
          backgroundColor: "#fff",
          marginTop: 4,
        }}
      >
        {addButtonLabel}
      </button>
    );
  }

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#fff",
        padding: 8,
        display: "grid",
        gap: 6,
        marginTop: 4,
      }}
    >
      <input
        autoFocus
        value={newBoardName}
        onChange={(e) => setNewBoardName(e.target.value)}
        maxLength={20}
        placeholder={placeholder}
        style={{
          height: 30,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "0 8px",
          fontSize: 13,
        }}
      />
      <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setNewBoardName("");
          }}
          style={{
            height: 28,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#fff",
            color: "#374151",
            fontSize: 12,
            fontWeight: 700,
            padding: "0 10px",
            cursor: "pointer",
          }}
        >
          취소
        </button>
        <button
          type="button"
          disabled={busy || !newBoardName.trim() || !onAdd}
          onClick={async () => {
            if (!onAdd || !newBoardName.trim()) return;
            await onAdd(newBoardName.trim());
            setIsAdding(false);
            setNewBoardName("");
          }}
          style={{
            height: 28,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#fff",
            color: "#374151",
            fontSize: 12,
            fontWeight: 700,
            padding: "0 10px",
            cursor: "pointer",
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
}
