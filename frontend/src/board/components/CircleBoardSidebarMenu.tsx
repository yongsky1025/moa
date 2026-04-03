import { useMemo } from "react";
import type { CircleBoardKind, CircleBoardResponse } from "../../api/circleBoardApi";
import BoardAddDraftPanel from "./BoardAddDraftPanel";

interface CircleBoardSidebarMenuProps {
  boards: CircleBoardResponse[];
  selectedBoard: "all" | number;
  onSelectBoard: (board: "all" | number) => void;
  isActive?: boolean;
  editable?: boolean;
  onCreateBoard?: (name: string) => Promise<void> | void;
  busy?: boolean;
  changedBoardIds?: number[];
  pendingAddedBoards?: Array<{ name: string; circleBoardKind: CircleBoardKind }>;
}

const CIRCLE_BOARD_KIND_ORDER: Record<string, number> = {
  NOTICE: 0,
  INTRO: 1,
  ACTIVITY: 2,
  CUSTOM: 3,
};

const CIRCLE_BOARD_KIND_LABEL: Record<string, string> = {
  NOTICE: "공지사항",
  INTRO: "가입인사",
  ACTIVITY: "활동",
  CUSTOM: "커스텀",
};

export default function CircleBoardSidebarMenu({
  boards,
  selectedBoard,
  onSelectBoard,
  isActive = true,
  editable = false,
  onCreateBoard,
  busy = false,
  changedBoardIds = [],
  pendingAddedBoards = [],
}: CircleBoardSidebarMenuProps) {
  const sortedBoards = useMemo(
    () =>
      [...boards]
        .filter((board) => board.circleBoardKind !== "ACTIVITY")
        .sort((a, b) => {
        const aOrder = CIRCLE_BOARD_KIND_ORDER[a.circleBoardKind ?? "CUSTOM"] ?? 99;
        const bOrder = CIRCLE_BOARD_KIND_ORDER[b.circleBoardKind ?? "CUSTOM"] ?? 99;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.boardId - b.boardId;
      }),
    [boards],
  );

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 10,
        display: "grid",
        gap: 6,
      }}
    >
      <p
        style={{
          margin: "2px 2px 4px",
          fontSize: 12,
          color: "#6b7280",
          fontWeight: 700,
        }}
      >
        게시판
      </p>

      <button
        type="button"
        onClick={() => onSelectBoard("all")}
        style={{
          width: "100%",
          border: "none",
          color: "#1f2937",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 12px",
          textAlign: "left",
          cursor: "pointer",
          backgroundColor: isActive && selectedBoard === "all" ? "#EAF4F0" : "#f9fafb",
        }}
      >
        전체게시판
      </button>

      {sortedBoards.map((board) => (
        <button
          key={board.boardId}
          type="button"
          onClick={() => onSelectBoard(board.boardId)}
          style={{
            width: "100%",
            border: "none",
            color: "#1f2937",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
            padding: "10px 12px",
            textAlign: "left",
            cursor: "pointer",
            backgroundColor:
              isActive && selectedBoard === board.boardId ? "#EAF4F0" : "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>
            {board.name?.trim() || CIRCLE_BOARD_KIND_LABEL[board.circleBoardKind ?? "CUSTOM"] || "게시판"}
          </span>
          {changedBoardIds.includes(board.boardId) ? (
            <span className="community-board-item-changed">(수정)</span>
          ) : null}
        </button>
      ))}

      {pendingAddedBoards.map((board, index) => (
        <div
          key={`pending-circle-board-${board.name}-${index}`}
          style={{
            width: "100%",
            color: "#4b5563",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
            padding: "10px 12px",
            textAlign: "left",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>{board.name}</span>
          <span className="community-board-item-changed">(추가)</span>
        </div>
      ))}

      <BoardAddDraftPanel
        enabled={editable}
        busy={busy}
        placeholder="게시판 이름 입력"
        onAdd={onCreateBoard}
      />
    </section>
  );
}
