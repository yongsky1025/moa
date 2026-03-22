import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useSelector } from "react-redux";
import { Check, Pencil, Plus, RotateCcw, Settings, X } from "lucide-react";
import { useCircleBoards } from "../hooks/useCircleBoards";
import { postRoutes } from "../../post/routes/postRoutes";
import { boardApi } from "../api/boardApi";
import { circleApi } from "../../api/circleApi";
import type { BoardResponse } from "../types/boardTypes";
import type { RootState } from "../../users/reducers/store";
import { getErrorMessage } from "../../common/utils/errorMessage";

export interface CircleBoardSideMenuProps {
  circleId: number;
  title?: string;
  showAllItem?: boolean;
  currentBoardId?: number;
  onBoardSelect?: (boardId: number | null) => void;
}

export default function CircleBoardSideMenu({
  circleId,
  title = "게시판",
  showAllItem = true,
  currentBoardId,
  onBoardSelect,
}: CircleBoardSideMenuProps) {
  const {
    data: boards,
    loading,
    error,
    refetch,
  } = useCircleBoards({
    circleId,
    enabled: true,
  });
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [isLeader, setIsLeader] = useState(false);
  const [isCheckingLeader, setIsCheckingLeader] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [snapshotBoards, setSnapshotBoards] = useState<BoardResponse[]>([]);
  const [draftBoards, setDraftBoards] = useState<
    Array<{ boardId: number; name: string }>
  >([]);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [unconfirmedNewBoardIds, setUnconfirmedNewBoardIds] = useState<
    number[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [nextTempId, setNextTempId] = useState(-1);

  useEffect(() => {
    if (editMode) return;
    setSnapshotBoards(boards);
    setDraftBoards(
      boards.map((board) => ({ boardId: board.boardId, name: board.name })),
    );
  }, [boards, editMode]);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setIsLeader(false);
      setIsCheckingLeader(false);
      return;
    }

    let cancelled = false;
    setIsCheckingLeader(true);
    void circleApi
      .getActiveMembers(circleId, { size: 300 })
      .then((res) => {
        if (cancelled) return;
        const me = res.data.dtoList.find(
          (member) => member.nickname === user.nickname,
        );
        setIsLeader(me?.role === "LEADER");
      })
      .catch(() => {
        if (cancelled) return;
        setIsLeader(false);
      })
      .finally(() => {
        if (cancelled) return;
        setIsCheckingLeader(false);
      });

    return () => {
      cancelled = true;
    };
  }, [circleId, isLoggedIn, user]);

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

  const enterEditMode = () => {
    setSnapshotBoards(boards);
    setDraftBoards(
      boards.map((board) => ({ boardId: board.boardId, name: board.name })),
    );
    setEditingBoardId(null);
    setEditingName("");
    setUnconfirmedNewBoardIds([]);
    setEditError("");
    setEditMode(true);
  };

  const handleReset = () => {
    setDraftBoards(
      snapshotBoards.map((board) => ({
        boardId: board.boardId,
        name: board.name,
      })),
    );
    setEditingBoardId(null);
    setEditingName("");
    setUnconfirmedNewBoardIds([]);
    setEditError("");
  };

  const removeDraftBoard = (boardId: number) => {
    const target = draftBoards.find((board) => board.boardId === boardId);
    const targetName = target?.name.trim() || "이 게시판";
    const ok = window.confirm(`정말 삭제하시겠습니까?`);
    if (!ok) return;

    setDraftBoards((prev) => prev.filter((board) => board.boardId !== boardId));
    setUnconfirmedNewBoardIds((prev) => prev.filter((id) => id !== boardId));
    if (editingBoardId === boardId) {
      setEditingBoardId(null);
      setEditingName("");
    }
  };

  const addDraftBoard = () => {
    const tempId = nextTempId;
    setNextTempId((prev) => prev - 1);
    setDraftBoards((prev) => [...prev, { boardId: tempId, name: "" }]);
    setUnconfirmedNewBoardIds((prev) => [...prev, tempId]);
    setEditingBoardId(tempId);
    setEditingName("");
    setEditError("");
  };

  const finishRowEdit = (boardId?: number) => {
    if (boardId != null && unconfirmedNewBoardIds.includes(boardId)) {
      setDraftBoards((prev) =>
        prev.filter((board) => board.boardId !== boardId),
      );
      setUnconfirmedNewBoardIds((prev) => prev.filter((id) => id !== boardId));
    }
    setEditingBoardId(null);
    setEditingName("");
  };

  const confirmRowEdit = (boardId: number) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setEditError("게시판 이름을 입력해주세요.");
      return;
    }

    setDraftBoards((prev) =>
      prev.map((board) =>
        board.boardId === boardId ? { ...board, name: trimmedName } : board,
      ),
    );
    setUnconfirmedNewBoardIds((prev) => prev.filter((id) => id !== boardId));
    setEditingBoardId(null);
    setEditingName("");
    setEditError("");
  };

  const startRowEdit = (boardId: number) => {
    const target = draftBoards.find((board) => board.boardId === boardId);
    setEditingBoardId(boardId);
    setEditingName(target?.name ?? "");
    setEditError("");
  };

  const hasEmptyName = draftBoards.some(
    (board) => board.name.trim().length === 0,
  );

  const handleApply = async () => {
    if (hasEmptyName) {
      setEditError("게시판 이름을 입력해주세요.");
      return;
    }
    const ok = window.confirm("변경사항을 적용하시겠습니까?");
    if (!ok) return;

    setSaving(true);
    setEditError("");
    try {
      const snapshotMap = new Map(
        snapshotBoards.map((board) => [board.boardId, board]),
      );
      const draftIdSet = new Set(draftBoards.map((board) => board.boardId));

      const deleteTargets = snapshotBoards
        .filter((board) => !draftIdSet.has(board.boardId))
        .map((board) => board.boardId);
      for (const boardId of deleteTargets) {
        await boardApi.deleteCircleBoard(circleId, boardId);
      }

      const updateTargets = draftBoards.filter((board) => {
        if (board.boardId <= 0) return false;
        const original = snapshotMap.get(board.boardId);
        if (!original) return false;
        return original.name !== board.name.trim();
      });
      for (const board of updateTargets) {
        await boardApi.updateCircleBoard(circleId, board.boardId, {
          boardType: "CIRCLE",
          name: board.name.trim(),
        });
      }

      const createTargets = draftBoards.filter((board) => board.boardId <= 0);
      for (const board of createTargets) {
        await boardApi.createCircleBoard(circleId, {
          boardType: "CIRCLE",
          name: board.name.trim(),
        });
      }

      await refetch();
      setEditMode(false);
      setEditingBoardId(null);
      setEditingName("");
      setUnconfirmedNewBoardIds([]);
      setEditError("");
    } catch (e) {
      setEditError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>
          {title}
        </h2>

        {!isCheckingLeader && isLeader && !loading && !error && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {!editMode ? (
              <button
                type="button"
                aria-label="게시판 편집"
                onClick={enterEditMode}
                style={iconButtonStyle}
              >
                <Settings size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  aria-label="변경사항 되돌리기"
                  onClick={handleReset}
                  disabled={saving}
                  style={iconButtonStyle}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  aria-label="변경사항 적용"
                  onClick={() => void handleApply()}
                  disabled={saving}
                  style={iconButtonStyle}
                >
                  <Check size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {loading && (
        <p style={{ margin: 0, fontSize: 13, color: "#777" }}>
          게시판 불러오는 중...
        </p>
      )}

      {!loading && error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#dc2626", flex: 1 }}>
            불러오기 실패: {error}
          </p>
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

      {!loading && !error && editError && (
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#dc2626" }}>
          {editError}
        </p>
      )}

      {!loading && !error && draftBoards.length === 0 && !editMode && (
        <p style={{ margin: 0, fontSize: 13, color: "#777" }}>
          게시판이 없습니다.
        </p>
      )}

      {!loading && !error && (draftBoards.length > 0 || editMode) && (
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {showAllItem && !editMode && (
            <Link
              to={postRoutes.circleAll(circleId)}
              style={getItemStyle(currentBoardId == null)}
              onClick={() => onBoardSelect?.(null)}
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

          {draftBoards.map((board) => {
            const active = !editMode && currentBoardId === board.boardId;
            const isRowEditing = editingBoardId === board.boardId;
            if (!editMode) {
              return (
                <Link
                  key={board.boardId}
                  to={postRoutes.circleBoard(circleId, board.boardId)}
                  style={getItemStyle(active)}
                  onClick={() => onBoardSelect?.(board.boardId)}
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
            }

            return (
              <div key={board.boardId} style={getItemStyle(active)}>
                {isRowEditing ? (
                  <input
                    value={editingName}
                    placeholder="게시판 이름"
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => finishRowEdit(board.boardId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        confirmRowEdit(board.boardId);
                      }
                      if (e.key === "Escape") finishRowEdit(board.boardId);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontSize: 13,
                      backgroundColor: "#f9fafb",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {board.name.trim() || "(이름 없음)"}
                  </span>
                )}

                {!isRowEditing ? (
                  <button
                    type="button"
                    aria-label="게시판 이름 수정"
                    onClick={() => startRowEdit(board.boardId)}
                    style={iconButtonStyle}
                  >
                    <Pencil size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="게시판 이름 확인"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => confirmRowEdit(board.boardId)}
                    style={iconButtonStyle}
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="게시판 삭제"
                  onClick={() => removeDraftBoard(board.boardId)}
                  style={iconButtonStyle}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {editMode && (
            <button
              type="button"
              onClick={addDraftBoard}
              style={{
                ...getItemStyle(false),
                width: "100%",
                border: "1px dashed #d1d5db",
                cursor: "pointer",
                justifyContent: "center",
                color: "#374151",
                backgroundColor: "#f9fafb",
              }}
            >
              <Plus size={14} />
              게시판 추가
            </button>
          )}
        </nav>
      )}
    </section>
  );
}

const iconButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  width: 28,
  height: 28,
  backgroundColor: "#fff",
  color: "#4b5563",
  cursor: "pointer",
  padding: 0,
};
