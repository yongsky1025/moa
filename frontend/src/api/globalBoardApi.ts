import api from "./axiosInstance";
import type { BoardResponse } from "../board/types/boardTypes";
import type { BoardRequest } from "../board/types/boardTypes";
import type { BoardScopedCreateRequest } from "../board/types/boardTypes";

export const globalBoardApi = {
  getBoards: () => api.get<BoardResponse[]>("/api/boards/global"),

  updateBoardName: (boardId: number, name: string) =>
    api.put<number>(`/api/boards/global/${boardId}`, { name }),

  deleteBoard: (boardId: number) => api.delete<void>(`/api/boards/global/${boardId}`),

  createBoard: (data: Pick<BoardRequest, "boardType" | "name">) =>
    api.post<number>("/api/boards/global", data),

  createScopedBoard: (data: BoardScopedCreateRequest) =>
    api.post<number>("/api/boards", data),
};
