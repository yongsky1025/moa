import BoardSkeletonPreviewPage from "../board/pages/BoardSkeletonPreviewPage";
import BoardCommunityPage from "../board/pages/BoardCommunityPage";
import PostDetailPage from "../post/pages/PostDetailPage";
import PostFormPage from "../post/pages/PostFormPage";
import { postRoutes } from "../post/routes/postRoutes";

export const boardRouter = () => {
  return [
    { index: true, Component: BoardCommunityPage },
    { path: "preview/skeleton", Component: BoardSkeletonPreviewPage },
    // 자유
    { path: postRoutes.freeCreatePattern, Component: PostFormPage },
    { path: postRoutes.freeDetailPattern, Component: PostDetailPage },
    { path: postRoutes.freeEditPattern, Component: PostFormPage },
    // 공지
    { path: postRoutes.noticeCreatePattern, Component: PostFormPage },
    { path: postRoutes.noticeDetailPattern, Component: PostDetailPage },
    { path: postRoutes.noticeEditPattern, Component: PostFormPage },
  ];
};
