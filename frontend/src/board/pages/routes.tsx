import type { RouteObject } from 'react-router-dom';
import BoardHomePage from './BoardHomePage';
import BoardDetailPage from './BoardDetailPage';
import BoardNotFoundPage from './BoardNotFoundPage';
import CircleBoardCreatePage from './CircleBoardCreatePage';
import CircleBoardEditPage from './CircleBoardEditPage';
import CircleBoardListPage from './CircleBoardListPage';
import CirclePostCreatePage from './CirclePostCreatePage';
import CirclePostEditPage from './CirclePostEditPage';
import GlobalBoardPage from './GlobalBoardPage';
import GlobalPostCreatePage from './GlobalPostCreatePage';
import GlobalPostDetailPage from './GlobalPostDetailPage';
import GlobalPostEditPage from './GlobalPostEditPage';
import {
  LegacyCircleBoardCreateRedirect,
  LegacyCircleBoardDetailRedirect,
  LegacyCircleBoardEditRedirect,
  LegacyCircleBoardsRedirect,
  LegacyCirclePostCreateRedirect,
  LegacyCirclePostDetailRedirect,
  LegacyCirclePostEditRedirect,
  LegacyGlobalBoardRedirect,
  LegacyGlobalPostCreateRedirect,
  LegacyGlobalPostDetailRedirect,
  LegacyGlobalPostEditRedirect,
} from './LegacyRouteRedirects';
import PostDetailPage from './PostDetailPage';

export const boardRoutes: RouteObject[] = [
  { index: true, Component: BoardHomePage },
  { path: 'global/:boardType', Component: GlobalBoardPage },
  { path: 'global/:boardType/posts/new', Component: GlobalPostCreatePage },
  { path: 'global/:boardType/posts/:postId', Component: GlobalPostDetailPage },
  { path: 'global/:boardType/posts/:postId/edit', Component: GlobalPostEditPage },
  { path: 'circle/:circleId/boards', Component: CircleBoardListPage },
  { path: 'circle/:circleId/boards/new', Component: CircleBoardCreatePage },
  { path: 'circle/:circleId/boards/:boardId', Component: BoardDetailPage },
  {
    path: 'circle/:circleId/boards/:boardId/edit',
    Component: CircleBoardEditPage,
  },
  {
    path: 'circle/:circleId/boards/:boardId/posts/new',
    Component: CirclePostCreatePage,
  },
  {
    path: 'circle/:circleId/boards/:boardId/posts/:postId',
    Component: PostDetailPage,
  },
  {
    path: 'circle/:circleId/boards/:boardId/posts/:postId/edit',
    Component: CirclePostEditPage,
  },
  { path: 'boards/:boardType', Component: LegacyGlobalBoardRedirect },
  { path: 'boards/:boardType/posts/new', Component: LegacyGlobalPostCreateRedirect },
  { path: 'boards/:boardType/posts/:postId', Component: LegacyGlobalPostDetailRedirect },
  { path: 'boards/:boardType/posts/:postId/edit', Component: LegacyGlobalPostEditRedirect },
  { path: 'circles/:circleId/boards', Component: LegacyCircleBoardsRedirect },
  { path: 'circles/:circleId/boards/new', Component: LegacyCircleBoardCreateRedirect },
  { path: 'circles/:circleId/boards/:boardId', Component: LegacyCircleBoardDetailRedirect },
  { path: 'circles/:circleId/boards/:boardId/edit', Component: LegacyCircleBoardEditRedirect },
  { path: 'circles/:circleId/boards/:boardId/posts/new', Component: LegacyCirclePostCreateRedirect },
  { path: 'circles/:circleId/boards/:boardId/posts/:postId', Component: LegacyCirclePostDetailRedirect },
  {
    path: 'circles/:circleId/boards/:boardId/posts/:postId/edit',
    Component: LegacyCirclePostEditRedirect,
  },
  { path: '*', Component: BoardNotFoundPage },
];
