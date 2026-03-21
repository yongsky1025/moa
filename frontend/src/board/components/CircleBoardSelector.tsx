import type { BoardResponse } from "../types/boardTypes";

interface CircleBoardSelectorProps {
  boards: BoardResponse[];
  selectedBoardId?: number;
  onChange: (boardId?: number) => void;
}

export default function CircleBoardSelector({ boards, selectedBoardId, onChange }: CircleBoardSelectorProps) {
  return (
    <select
      value={selectedBoardId ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
    >
      <option value="">전체 게시판</option>
      {boards.map((board) => (
        <option key={board.boardId} value={board.boardId}>
          {board.name}
        </option>
      ))}
    </select>
  );
}
