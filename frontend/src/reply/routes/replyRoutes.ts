// 댓글(Reply) 관련 경로 상수 모음
// - 현재는 백엔드 API 경로 형태를 명시해 공통 참조용으로 사용
export const replyRoutes = {
  // 댓글 목록 조회/댓글 작성
  list: (postId: number | string) => `/api/posts/${postId}/replies`,
  create: (postId: number | string) => `/api/posts/${postId}/replies`,
  // 대댓글 작성
  createChild: (postId: number | string, replyId: number | string) => `/api/posts/${postId}/replies/${replyId}`,
  // 댓글 수정
  update: (postId: number | string, replyId: number | string) => `/api/posts/${postId}/replies/${replyId}`,
  // 댓글 삭제
  delete: (postId: number | string, replyId: number | string) => `/api/posts/${postId}/replies/${replyId}`,
};
