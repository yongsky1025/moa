import type { CommunityBoardFilter } from "./CommunityLeftSidebar";

interface CommunityBoardMenuProps {
  selectedBoard: CommunityBoardFilter;
  isActive: boolean;
  onSelectBoard: (board: CommunityBoardFilter) => void;
}

const BOARD_ITEMS: Array<{ value: CommunityBoardFilter; label: string }> = [
  { value: "all", label: "전체게시판" },
  { value: "notice", label: "공지사항" },
  { value: "free", label: "자유게시판" },
  { value: "review", label: "모임 후기" },
  { value: "qna", label: "Q&A" },
];

export default function CommunityBoardMenu({
  selectedBoard,
  isActive,
  onSelectBoard,
}: CommunityBoardMenuProps) {
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
      {BOARD_ITEMS.map((item) => (
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
          }}
        >
          {item.label}
        </button>
      ))}
    </section>
  );
}
