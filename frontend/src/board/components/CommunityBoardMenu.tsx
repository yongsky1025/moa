import type { CommunityBoardFilter } from "./CommunityLeftSidebar";
import { useMemo } from "react";
import BoardAddDraftPanel from "./BoardAddDraftPanel";

interface CommunityBoardMenuProps {
  selectedBoard: CommunityBoardFilter;
  isActive: boolean;
  onSelectBoard: (board: CommunityBoardFilter) => void;
  noticeLabel?: string;
  freeLabel?: string;
  hasNoticeBoard?: boolean;
  hasFreeBoard?: boolean;
  noticeChanged?: boolean;
  freeChanged?: boolean;
  canAddBoard?: boolean;
  onAddBoard?: (name: string) => void;
  pendingAddedBoardNames?: string[];
  extraBoards?: Array<{ boardId: number; label: string }>;
}

export default function CommunityBoardMenu({
  selectedBoard,
  isActive,
  onSelectBoard,
  noticeLabel = "공지사항",
  freeLabel = "자유게시판",
  hasNoticeBoard = true,
  hasFreeBoard = true,
  noticeChanged = false,
  freeChanged = false,
  canAddBoard = false,
  onAddBoard,
  pendingAddedBoardNames = [],
  extraBoards = [],
}: CommunityBoardMenuProps) {
  const renderedItems: Array<{ value: CommunityBoardFilter; label: string }> = [
    { value: "all", label: "전체게시판" },
    ...(hasNoticeBoard ? [{ value: "notice" as const, label: noticeLabel }] : []),
    ...(hasFreeBoard ? [{ value: "free" as const, label: freeLabel }] : []),
    ...extraBoards.map((board) => ({ value: board.boardId, label: board.label })),
  ];

  const addTargetLabel = useMemo(() => {
    if (!hasNoticeBoard) return "공지사항";
    if (!hasFreeBoard) return "자유게시판";
    return "게시판";
  }, [hasFreeBoard, hasNoticeBoard]);

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
      {renderedItems.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelectBoard(item.value)}
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
              isActive && selectedBoard === item.value ? "#EAF4F0" : "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {item.label}
          {(item.value === "notice" && noticeChanged) ||
          (item.value === "free" && freeChanged) ? (
            <span className="community-board-item-changed">(수정)</span>
          ) : null}
        </button>
      ))}
      {pendingAddedBoardNames.map((name, index) => (
        <div
          key={`pending-board-${name}-${index}`}
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
          <span>{name}</span>
          <span className="community-board-item-changed">(추가)</span>
        </div>
      ))}
      <BoardAddDraftPanel
        enabled={canAddBoard}
        placeholder={`${addTargetLabel} 이름 입력`}
        onAdd={onAddBoard}
      />
    </section>
  );
}
