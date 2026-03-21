import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useCircleBoards } from "../hooks/useCircleBoards";
import { postRoutes } from "../../post/routes/postRoutes";

export interface CircleBoardSideMenuProps {
  circleId: number;
  title?: string;
  showAllItem?: boolean;
  currentBoardId?: number;
}

export default function CircleBoardSideMenu({
  circleId,
  title = "게시판",
  showAllItem = true,
  currentBoardId,
}: CircleBoardSideMenuProps) {
  const { data: boards, loading, error, refetch } = useCircleBoards({
    circleId,
    enabled: true,
  });

  const getItemStyle = (active: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    padding: "8px 10px",
    textDecoration: "none",
    fontSize: 14,
    color: active ? "#111827" : "#4b5563",
    fontWeight: active ? 700 : 500,
    backgroundColor: active ? "#f3f4f6" : "transparent",
    transition: "background-color 0.15s ease",
  });

  return (
    <section
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>{title}</h2>

      {loading && <p style={{ margin: 0, fontSize: 13, color: "#777" }}>게시판 불러오는 중...</p>}

      {!loading && error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#dc2626", flex: 1 }}>불러오기 실패: {error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "6px 10px",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: 12,
              color: "#333",
            }}
          >
            재시도
          </button>
        </div>
      )}

      {!loading && !error && boards.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "#777" }}>게시판이 없습니다.</p>}

      {!loading && !error && boards.length > 0 && (
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {showAllItem && (
            <Link
              to={postRoutes.circleAll(circleId)}
              style={getItemStyle(currentBoardId == null)}
              onMouseEnter={(e) => {
                if (currentBoardId == null) return;
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (currentBoardId == null) return;
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              전체
            </Link>
          )}

          {boards.map((board) => {
            const active = currentBoardId === board.boardId;
            return (
              <Link
                key={board.boardId}
                to={postRoutes.circleBoard(circleId, board.boardId)}
                style={getItemStyle(active)}
                onMouseEnter={(e) => {
                  if (active) return;
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (active) return;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {board.name}
              </Link>
            );
          })}
        </nav>
      )}
    </section>
  );
}
