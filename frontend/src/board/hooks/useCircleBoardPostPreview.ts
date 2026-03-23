import { useCallback, useEffect, useState } from "react";
import { boardApi } from "../api/boardApi";
import type { BoardResponse } from "../types/boardTypes";
import type { PostResponse } from "../../post/types/postTypes";
import { postApi } from "../../post/api/postApi";
import { getErrorMessage } from "../../common/utils/errorMessage";

export interface CircleBoardPostPreviewItem {
  board: BoardResponse;
  posts: PostResponse[];
}

export function useCircleBoardPostPreview(circleId: number, limitPerBoard = 5) {
  const [data, setData] = useState<CircleBoardPostPreviewItem[]>([]);
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const boardResponse = await boardApi.getCircleBoards(circleId);
      const boards = boardResponse.data;
      setBoards(boards);

      if (boards.length === 0) {
        setData([]);
        setSelectedBoardId(null);
        setTotalPostCount(0);
        return;
      }

      const items = await Promise.all(
        boards.map(async (board) => {
          const postResponse = await postApi.getCircleBoardPosts(circleId, board.boardId);
          return {
            board,
            posts: postResponse.data.slice(0, limitPerBoard),
            totalCount: postResponse.data.length,
          };
        }),
      );

      setData(items.map(({ board, posts }) => ({ board, posts })));
      setTotalPostCount(items.reduce((sum, item) => sum + item.totalCount, 0));
      setSelectedBoardId((prev) => {
        if (prev && boards.some((board) => board.boardId === prev)) return prev;
        return boards[0]?.boardId ?? null;
      });
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
      setBoards([]);
      setSelectedBoardId(null);
      setTotalPostCount(0);
    } finally {
      setLoading(false);
    }
  }, [circleId, limitPerBoard]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const selectedBoardPosts = selectedBoardId
    ? data.find((item) => item.board.boardId === selectedBoardId)?.posts ?? []
    : [];

  return {
    data,
    boards,
    selectedBoardId,
    selectedBoardPosts,
    totalPostCount,
    loading,
    error,
    refetch,
    setSelectedBoardId,
  };
}
