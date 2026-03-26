import api from "../../api/axiosInstance";
import type { BoardRequest, BoardResponse } from "../types/boardTypes";

// 게시판(Board) 도메인의 백엔드 호출 모음
// - 써클 게시판 조회/생성/수정/삭제 API를 담당
export const boardApi = {
  // 특정 써클의 게시판 목록 조회
  getCircleBoards: (circleId: number) =>
    api.get<BoardResponse[]>(`/api/circle/${circleId}/boards`),

  // 특정 써클에 게시판 생성
  createCircleBoard: (circleId: number, data: BoardRequest) =>
    api.post<number>(`/api/circle/${circleId}/boards`, data),

  // 특정 써클의 게시판 이름 수정
  updateCircleBoard: (circleId: number, boardId: number, data: BoardRequest) =>
    api.put<number>(`/api/circle/${circleId}/boards/${boardId}`, data),

  // 특정 써클의 게시판 삭제
  deleteCircleBoard: (circleId: number, boardId: number) =>
    api.delete<void>(`/api/circle/${circleId}/boards/${boardId}`),
};
