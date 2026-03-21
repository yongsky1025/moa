// 게시글(Post) 화면에서 사용할 프론트 경로 상수 모음
// - 게시글 목록/상세/작성/수정 이동 경로를 담당
export const postRoutes = {
  // 자유게시판 게시글 경로
  freeBase: "/board/free",
  freeBasePattern: "free",
  freeDetail: (postId: number | string) => `/board/free/${postId}`,
  freeDetailPattern: "free/:postId",
  freeCreate: "/board/free/create",
  freeCreatePattern: "free/create",
  freeEdit: (postId: number | string) => `/board/free/${postId}/edit`,
  freeEditPattern: "free/:postId/edit",

  // 공지게시판 게시글 경로
  noticeBase: "/board/notice",
  noticeBasePattern: "notice",
  noticeDetail: (postId: number | string) => `/board/notice/${postId}`,
  noticeDetailPattern: "notice/:postId",
  noticeCreate: "/board/notice/create",
  noticeCreatePattern: "notice/create",
  noticeEdit: (postId: number | string) => `/board/notice/${postId}/edit`,
  noticeEditPattern: "notice/:postId/edit",

  // 써클 게시판 게시글 경로
  circleAll: (circleId: number | string) => `/board/circle/${circleId}/posts`,
  circleAllPattern: "circle/:circleId/posts",
  circleBoard: (circleId: number | string, boardId: number | string) =>
    `/board/circle/${circleId}/boards/${boardId}/posts`,
  circleBoardPattern: "circle/:circleId/boards/:boardId/posts",
  circleDetail: (circleId: number | string, boardId: number | string, postId: number | string) =>
    `/board/circle/${circleId}/boards/${boardId}/posts/${postId}`,
  circleDetailPattern: "circle/:circleId/boards/:boardId/posts/:postId",
  circleCreate: (circleId: number | string, boardId: number | string) =>
    `/board/circle/${circleId}/boards/${boardId}/posts/create`,
  circleCreatePattern: "circle/:circleId/boards/:boardId/posts/create",
  circleEdit: (circleId: number | string, boardId: number | string, postId: number | string) =>
    `/board/circle/${circleId}/boards/${boardId}/posts/${postId}/edit`,
  circleEditPattern: "circle/:circleId/boards/:boardId/posts/:postId/edit",
};
