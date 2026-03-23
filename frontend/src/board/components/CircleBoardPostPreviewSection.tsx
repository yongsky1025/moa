import { useEffect } from "react";
import { Link } from "react-router-dom";
import BoardPreviewCard from "./BoardPreviewCard";
import { useCircleBoardPostPreview } from "../hooks/useCircleBoardPostPreview";
import { postRoutes } from "../../post/routes/postRoutes";

export interface CircleBoardPostPreviewSectionProps {
  circleId: number;
  limitPerBoard?: number;
  selectedBoardId?: number | null;
  onSelectedBoardChange?: (boardId: number | null) => void;
}

export default function CircleBoardPostPreviewSection({
  circleId,
  limitPerBoard = 5,
  selectedBoardId,
  onSelectedBoardChange,
}: CircleBoardPostPreviewSectionProps) {
  const {
    data,
    boards,
    selectedBoardId: internalSelectedBoardId,
    totalPostCount,
    loading,
    error,
    refetch,
    setSelectedBoardId,
  } = useCircleBoardPostPreview(circleId, limitPerBoard);

  const isControlled = selectedBoardId !== undefined;
  const effectiveSelectedBoardId = isControlled
    ? selectedBoardId
    : internalSelectedBoardId;
  const hasEffectiveSelection =
    effectiveSelectedBoardId != null &&
    boards.some((board) => board.boardId === effectiveSelectedBoardId);
  const resolvedSelectedBoardId = hasEffectiveSelection
    ? effectiveSelectedBoardId
    : (boards[0]?.boardId ?? null);

  useEffect(() => {
    if (!boards.length) {
      onSelectedBoardChange?.(null);
      return;
    }
    if (resolvedSelectedBoardId == null) return;
    if (!isControlled && internalSelectedBoardId !== resolvedSelectedBoardId) {
      setSelectedBoardId(resolvedSelectedBoardId);
    }
    if (effectiveSelectedBoardId !== resolvedSelectedBoardId) {
      onSelectedBoardChange?.(resolvedSelectedBoardId);
    }
  }, [
    boards,
    resolvedSelectedBoardId,
    isControlled,
    internalSelectedBoardId,
    setSelectedBoardId,
    effectiveSelectedBoardId,
    onSelectedBoardChange,
  ]);

  const selectedBoard = resolvedSelectedBoardId
    ? (boards.find((board) => board.boardId === resolvedSelectedBoardId) ??
      null)
    : null;
  const selectedBoardPosts = resolvedSelectedBoardId
    ? (data.find((item) => item.board.boardId === resolvedSelectedBoardId)
        ?.posts ?? [])
    : [];

  const handleSelectBoard = (boardId: number) => {
    if (!isControlled) {
      setSelectedBoardId(boardId);
    }
    onSelectedBoardChange?.(boardId);
  };

  return (
    <section style={{ marginTop: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, color: "#111" }}>
          게시글 {totalPostCount}
        </h2>
      </div>

      {loading && <p style={{ color: "#777" }}>게시판/게시글 불러오는 중...</p>}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ color: "#dc2626", margin: 0 }}>
            불러오기에 실패했습니다: {error}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "6px 10px",
              background: "white",
              cursor: "pointer",
            }}
          >
            재시도
          </button>
        </div>
      )}
      {!loading && !error && boards.length === 0 && (
        <p style={{ color: "#777" }}>게시판이 없습니다.</p>
      )}

      {!loading && !error && boards.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8f8f8",
            borderRadius: 12,
            border: "1px solid #ededed",
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {boards.map((board) => {
                const active = board.boardId === resolvedSelectedBoardId;
                return (
                  <button
                    key={board.boardId}
                    type="button"
                    onClick={() => handleSelectBoard(board.boardId)}
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

            <Link
              to={postRoutes.circleAll(circleId)}
              onClick={() => onSelectedBoardChange?.(null)}
              style={{
                color: "#333",
                fontSize: 14,
                textDecoration: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              전체 보기 &gt;
            </Link>
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
