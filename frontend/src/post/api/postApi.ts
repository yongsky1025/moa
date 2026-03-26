import api from "../../api/axiosInstance";
import type {
  PostReactionSummary,
  PostRequest,
  PostResponse,
} from "../types/postTypes";

// 게시글(Post) 도메인의 백엔드 호출 모음
// - 자유/공지/써클 게시글 CRUD API를 담당
export const postApi = {
  // 자유게시판 게시글
  getFreePosts: () => api.get<PostResponse[]>("/api/free"),
  getFreePost: (postId: number) => api.get<PostResponse>(`/api/free/${postId}`),
  createFreePost: (data: PostRequest) => api.post<number>("/api/free", data),
  updateFreePost: (postId: number, data: PostRequest) => api.put<number>(`/api/free/${postId}`, data),
  deleteFreePost: (postId: number) => api.delete<void>(`/api/free/${postId}`),

  // 공지게시판 게시글
  getNoticePosts: () => api.get<PostResponse[]>("/api/notice"),
  getNoticePost: (postId: number) => api.get<PostResponse>(`/api/notice/${postId}`),
  createNoticePost: (data: PostRequest) => api.post<number>("/api/notice", data),
  updateNoticePost: (postId: number, data: PostRequest) => api.put<number>(`/api/notice/${postId}`, data),
  deleteNoticePost: (postId: number) => api.delete<void>(`/api/notice/${postId}`),

  // 써클 게시판 게시글
  getCircleAllPosts: (circleId: number) => api.get<PostResponse[]>(`/api/circle/${circleId}/posts`),
  getCircleBoardPosts: (circleId: number, boardId: number) =>
    api.get<PostResponse[]>(`/api/circle/${circleId}/boards/${boardId}/posts`),
  getCirclePost: (circleId: number, boardId: number, postId: number) =>
    api.get<PostResponse>(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`),
  createCirclePost: (circleId: number, boardId: number, data: PostRequest) =>
    api.post<number>(`/api/circle/${circleId}/boards/${boardId}/posts`, data),
  updateCirclePost: (circleId: number, boardId: number, postId: number, data: PostRequest) =>
    api.put<number>(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`, data),
  deleteCirclePost: (circleId: number, boardId: number, postId: number) =>
    api.delete<void>(`/api/circle/${circleId}/boards/${boardId}/posts/${postId}`),

  reactToPost: (postId: number) =>
    api.post<PostReactionSummary>(`/api/posts/${postId}/reactions/like`),
};
