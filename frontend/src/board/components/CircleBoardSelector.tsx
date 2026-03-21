import type { BoardResponse } from "../types/boardTypes";

interface CircleBoardSelectorProps {
  boards: BoardResponse[];
  selectedBoardId?: number;
  onChange: (boardId?: number) => void;
  placeholderLabel?: string;
}

export default function CircleBoardSelector({
  boards,
  selectedBoardId,
  onChange,
  placeholderLabel = "전체 게시판",
}: CircleBoardSelectorProps) {
  return (
    <select
      value={selectedBoardId ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
    >
      <option value="">{placeholderLabel}</option>
      {boards.map((board) => (
        <option key={board.boardId} value={board.boardId}>
          {board.name}
        </option>
      ))}
    </select>
  );
}
