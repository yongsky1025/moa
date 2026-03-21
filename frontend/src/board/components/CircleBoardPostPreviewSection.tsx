import { Link } from "react-router-dom";
import BoardPreviewCard from "./BoardPreviewCard";
import { useCircleBoardPostPreview } from "../hooks/useCircleBoardPostPreview";
import { postRoutes } from "../../post/routes/postRoutes";

export interface CircleBoardPostPreviewSectionProps {
  circleId: number;
  limitPerBoard?: number;
}

export default function CircleBoardPostPreviewSection({
  circleId,
  limitPerBoard = 5,
}: CircleBoardPostPreviewSectionProps) {
  const {
    boards,
    selectedBoardId,
    selectedBoardPosts,
    totalPostCount,
    loading,
    error,
    refetch,
    setSelectedBoardId,
  } = useCircleBoardPostPreview(circleId, limitPerBoard);

  const selectedBoard = selectedBoardId
    ? boards.find((board) => board.boardId === selectedBoardId) ?? null
    : null;

  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: "#111" }}>게시글 {totalPostCount}</h2>
        <Link to={postRoutes.circleAll(circleId)} style={{ color: "#333", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>
          더보기 &gt;
        </Link>
      </div>

      {loading && <p style={{ color: "#777" }}>게시판/게시글 불러오는 중...</p>}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ color: "#dc2626", margin: 0 }}>불러오기에 실패했습니다: {error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", background: "white", cursor: "pointer" }}
          >
            재시도
          </button>
        </div>
      )}
      {!loading && !error && boards.length === 0 && <p style={{ color: "#777" }}>게시판이 없습니다.</p>}

      {!loading && !error && boards.length > 0 && (
        <div style={{ backgroundColor: "#f8f8f8", borderRadius: 12, border: "1px solid #ededed", padding: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {boards.map((board) => {
              const active = board.boardId === selectedBoardId;
              return (
                <button
                  key={board.boardId}
                  type="button"
                  onClick={() => setSelectedBoardId(board.boardId)}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                    backgroundColor: active ? "#111827" : "white",
                    color: active ? "white" : "#555",
                  }}
                >
                  {board.name}
                </button>
              );
            })}
          </div>

          {selectedBoard && (
            <BoardPreviewCard
              key={selectedBoard.boardId}
              circleId={circleId}
              board={selectedBoard}
              posts={selectedBoardPosts}
            />
          )}

          {selectedBoard && (
            <Link
              to={postRoutes.circleBoard(circleId, selectedBoard.boardId)}
              style={{
                marginTop: 12,
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                backgroundColor: "#ececec",
                color: "#111",
                borderRadius: 8,
                padding: "10px 12px",
                fontWeight: 700,
              }}
            >
              게시글 더보기
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
