import BoardSkeletonPreviewPage from "../board/pages/BoardSkeletonPreviewPage";
import BoardCommunityPage from "../board/pages/BoardCommunityPage";
import PostDetailPage from "../post/pages/PostDetailPage";
import UnifiedPostFormPage from "../post/pages/UnifiedPostFormPage";
import { postRoutes } from "../post/routes/postRoutes";

export const boardRouter = () => {
  return [
    { index: true, Component: BoardCommunityPage },
    { path: "preview/skeleton", Component: BoardSkeletonPreviewPage },
    { path: postRoutes.createPattern, Component: UnifiedPostFormPage },
    // 자유
    { path: postRoutes.freeCreatePattern, Component: UnifiedPostFormPage },
    { path: postRoutes.freeDetailPattern, Component: PostDetailPage },
    { path: postRoutes.freeEditPattern, Component: UnifiedPostFormPage },
    // 공지
    { path: postRoutes.noticeCreatePattern, Component: UnifiedPostFormPage },
    { path: postRoutes.noticeDetailPattern, Component: PostDetailPage },
    { path: postRoutes.noticeEditPattern, Component: UnifiedPostFormPage },
  ];
};
