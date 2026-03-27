import api from "../../api/axiosInstance";
import type {
  CommunitySidebarPost,
  CommunityMyReply,
  PostBookmarkSummary,
  PostReactionSummary,
  PostRequest,
  PostResponse,
  PostSearchHit,
  PostSearchTarget,
  PostSearchRequest,
  SearchPage,
} from "../types/postTypes";

// 게시글(Post) 도메인의 백엔드 호출 모음
// - 자유/공지 게시글 CRUD API를 담당
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
  toggleNoticePin: (postId: number) => api.post<boolean>(`/api/notice/${postId}/pin`),

  getCommunityPosts: (board: "all" | "notice" | "free" = "all") =>
    api.get<PostResponse[]>("/api/posts/community", { params: { board } }),

  getMyCommunityBookmarkedPosts: (params?: {
    board?: "all" | "notice" | "free";
    q?: string;
    target?: PostSearchTarget;
  }) =>
    api.get<PostResponse[]>("/api/posts/community/bookmarks", { params }),

  getMyCommunityPosts: (params?: {
    board?: "all" | "notice" | "free";
    q?: string;
    target?: PostSearchTarget;
  }) =>
    api.get<PostResponse[]>("/api/posts/community/my-posts", { params }),

  getMyCommunityRepliedPosts: (params?: {
    board?: "all" | "notice" | "free";
    q?: string;
    target?: PostSearchTarget;
  }) =>
    api.get<CommunityMyReply[]>("/api/posts/community/my-replies", { params }),

  getCommunitySidebarPosts: (params?: {
    board?: "all" | "notice" | "free";
    sort?: "recent" | "views" | "replies";
    limit?: number;
  }) => api.get<CommunitySidebarPost[]>("/api/posts/community/sidebar", { params }),

  searchPosts: (params: PostSearchRequest) =>
    api.get<SearchPage<PostSearchHit>>("/api/posts/search", { params }),

  reactToPost: (postId: number) =>
    api.post<PostReactionSummary>(`/api/posts/${postId}/reactions/like`),

  getMyPostBookmark: (postId: number) =>
    api.get<PostBookmarkSummary>(`/api/posts/${postId}/bookmarks`),

  togglePostBookmark: (postId: number) =>
    api.post<PostBookmarkSummary>(`/api/posts/${postId}/bookmarks`),
};
