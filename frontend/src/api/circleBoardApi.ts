import api from "./axiosInstance";
import type {
  CommunityMyReply,
  PostResponse,
  PostSearchTarget,
} from "../post/types/postTypes";

export type CircleBoardKind = "NOTICE" | "INTRO" | "ACTIVITY" | "CUSTOM";

export interface CircleBoardResponse {
  boardId: number;
  boardType: "CIRCLE" | "FREE" | "NOTICE";
  circleBoardKind: CircleBoardKind | null;
  name: string;
  circleId: number;
  createDate: string;
  updateDate: string;
}

export interface CirclePostCreateRequest {
  title: string;
  content: string;
  activityPublic?: boolean;
}

export interface CircleBoardCreateRequest {
  boardType?: "CIRCLE";
  name: string;
  circleBoardKind?: CircleBoardKind;
}

export const circleBoardApi = {
  getBoards: (circleId: number) =>
    api.get<CircleBoardResponse[]>(`/api/circle/${circleId}/boards`),

  getAllPosts: (
    circleId: number,
    params?: { circleBoardKind?: CircleBoardKind },
  ) => api.get<PostResponse[]>(`/api/circle/${circleId}/posts`, { params }),

  getMyBookmarkedPosts: (
    circleId: number,
    params?: { boardId?: number; circleBoardKind?: CircleBoardKind; q?: string; target?: PostSearchTarget },
  ) => api.get<PostResponse[]>(`/api/circle/${circleId}/bookmarks`, { params }),

  getMyPosts: (
    circleId: number,
    params?: { boardId?: number; circleBoardKind?: CircleBoardKind; q?: string; target?: PostSearchTarget },
  ) => api.get<PostResponse[]>(`/api/circle/${circleId}/my-posts`, { params }),

  getMyRepliedPosts: (
    circleId: number,
    params?: { boardId?: number; circleBoardKind?: CircleBoardKind; q?: string; target?: PostSearchTarget },
  ) => api.get<CommunityMyReply[]>(`/api/circle/${circleId}/my-replies`, { params }),

  getBoardPosts: (circleId: number, boardId: number) =>
    api.get<PostResponse[]>(`/api/circle/${circleId}/boards/${boardId}/posts`),

  getBoardPost: (circleId: number, boardId: number, postId: number) =>
    api.get<PostResponse>(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`),

  createPost: (
    circleId: number,
    boardId: number,
    data: CirclePostCreateRequest,
  ) => api.post<number>(`/api/circle/${circleId}/boards/${boardId}/posts`, data),

  updatePost: (
    circleId: number,
    boardId: number,
    postId: number,
    data: CirclePostCreateRequest,
  ) => api.put<number>(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`, data),

  deletePost: (circleId: number, boardId: number, postId: number) =>
    api.delete<void>(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`),

  createBoard: (circleId: number, data: CircleBoardCreateRequest) =>
    api.post<number>(`/api/circle/${circleId}/boards`, {
      boardType: "CIRCLE",
      ...data,
    }),

  updateBoardName: (circleId: number, boardId: number, name: string) =>
    api.put<number>(`/api/circle/${circleId}/boards/${boardId}`, { name }),

  deleteBoard: (circleId: number, boardId: number) =>
    api.delete<void>(`/api/circle/${circleId}/boards/${boardId}`),
};
