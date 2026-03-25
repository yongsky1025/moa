import api from "../../users/utils/jwtUtil";
import type {
  PageResponse,
  ReplyReactionSummary,
  ReplyRequest,
  ReplyResponse,
} from "../types/replyTypes";

// 댓글(Reply) 도메인의 백엔드 호출 모음
// - 댓글/대댓글 조회 및 CRUD API를 담당
export const replyApi = {
  // 특정 게시글의 댓글 목록 조회
  getReplies: (postId: number, page = 0, size = 20) =>
    api.get<PageResponse<ReplyResponse>>(`/api/posts/${postId}/replies`, {
      params: { page, size },
    }),
  // 댓글 작성
  createReply: (postId: number, data: ReplyRequest) => api.post<number>(`/api/posts/${postId}/replies`, data),
  // 대댓글 작성
  createChildReply: (postId: number, replyId: number, data: ReplyRequest) =>
    api.post<number>(`/api/posts/${postId}/replies/${replyId}`, data),
  // 댓글 수정
  updateReply: (postId: number, replyId: number, data: ReplyRequest) =>
    api.put<number>(`/api/posts/${postId}/replies/${replyId}`, data),
  // 댓글 삭제
  deleteReply: (postId: number, replyId: number) => api.delete<void>(`/api/posts/${postId}/replies/${replyId}`),
  // 댓글 좋아요 토글
  reactToReply: (postId: number, replyId: number) =>
    api.post<ReplyReactionSummary>(`/api/posts/${postId}/replies/${replyId}/reactions/like`),
};
