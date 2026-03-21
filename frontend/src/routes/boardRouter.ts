import { redirect } from "react-router-dom";
import CirclePostDetailPage from "../board/pages/CirclePostDetailPage";
import CirclePostFormPage from "../board/pages/CirclePostFormPage";
import CirclePostListPage from "../board/pages/CirclePostListPage";
import PostDetailPage from "../post/pages/PostDetailPage";
import PostFormPage from "../post/pages/PostFormPage";
import PostListPage from "../post/pages/PostListPage";
import { postRoutes } from "../post/routes/postRoutes";

export const boardRouter = () => {
  return [
    { index: true, loader: () => redirect(postRoutes.freeBase) },
    // 자유
    { path: postRoutes.freeBasePattern, Component: PostListPage },
    { path: postRoutes.freeCreatePattern, Component: PostFormPage },
    { path: postRoutes.freeDetailPattern, Component: PostDetailPage },
    { path: postRoutes.freeEditPattern, Component: PostFormPage },
    // 공지
    { path: postRoutes.noticeBasePattern, Component: PostListPage },
    { path: postRoutes.noticeCreatePattern, Component: PostFormPage },
    { path: postRoutes.noticeDetailPattern, Component: PostDetailPage },
    { path: postRoutes.noticeEditPattern, Component: PostFormPage },
    // 써클
    { path: postRoutes.circleAllPattern, Component: CirclePostListPage },
    { path: postRoutes.circleBoardPattern, Component: CirclePostListPage },
    { path: postRoutes.circleCreatePattern, Component: CirclePostFormPage },
    { path: postRoutes.circleDetailPattern, Component: CirclePostDetailPage },
    { path: postRoutes.circleEditPattern, Component: CirclePostFormPage },
  ];
};
