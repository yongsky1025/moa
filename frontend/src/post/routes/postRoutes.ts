// 게시글(Post) 화면에서 사용할 프론트 경로 상수 모음
// - 게시글 목록/상세/작성/수정 이동 경로를 담당
export const postRoutes = {
  // 공용 게시글 작성 경로
  createBase: "/board/create",
  createPattern: "create",

  // 자유게시판 게시글 경로
  freeBase: "/board?board=free",
  freeDetail: (postId: number | string) => `/board/free/${postId}`,
  freeDetailPattern: "free/:postId",
  freeCreate: "/board/free/create",
  freeCreatePattern: "free/create",
  freeEdit: (postId: number | string) => `/board/free/${postId}/edit`,
  freeEditPattern: "free/:postId/edit",

  // 공지게시판 게시글 경로
  noticeBase: "/board?board=notice",
  noticeDetail: (postId: number | string) => `/board/notice/${postId}`,
  noticeDetailPattern: "notice/:postId",
  noticeCreate: "/board/notice/create",
  noticeCreatePattern: "notice/create",
  noticeEdit: (postId: number | string) => `/board/notice/${postId}/edit`,
  noticeEditPattern: "notice/:postId/edit",
};
