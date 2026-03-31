import CircleListPage from '../circle/pages/CircleListPage';
import MyCirclesPage from '../circle/pages/MyCirclesPage';
import CircleDetailPage from '../circle/pages/CircleDetailPage';
import CircleFormPage from '../circle/pages/CircleFormPage';
import CircleMembersPage from '../circle/pages/CircleMembersPage';
import CircleManagePage from '../circle/pages/CircleManagePage';
import CircleBoardTabPage from '../board/pages/CircleBoardTabPage';
import CirclePhotoTabPage from '../post/pages/CirclePhotoTabPage';
import CirclePostDetailPage from '../post/pages/CirclePostDetailPage';
import UnifiedPostFormPage from '../post/pages/UnifiedPostFormPage';
import ScheduleListPage from '../schedule/pages/ScheduleListPage';
import ScheduleDetailPage from '../schedule/pages/ScheduleDetailPage';
import ScheduleFormPage from '../schedule/pages/ScheduleFormPage';

export const circleRouter = () => [
  { index: true, Component: CircleListPage },
  { path: 'my', Component: MyCirclesPage },
  { path: 'create', Component: CircleFormPage },
  { path: ':circleId', Component: CircleDetailPage },
  { path: ':circleId/board', Component: CircleBoardTabPage },
  { path: ':circleId/board/:boardId/posts/create', Component: UnifiedPostFormPage },
  { path: ':circleId/board/:boardId/posts/:postId', Component: CirclePostDetailPage },
  { path: ':circleId/board/:boardId/posts/:postId/edit', Component: UnifiedPostFormPage },
  { path: ':circleId/activity', Component: CirclePhotoTabPage },
  { path: ':circleId/photo', Component: CirclePhotoTabPage },
  { path: ':circleId/edit', Component: CircleFormPage },
  { path: ':circleId/members', Component: CircleMembersPage },
  { path: ':circleId/manage', Component: CircleManagePage },
  { path: ':circleId/schedules', Component: ScheduleListPage },
  { path: ':circleId/schedules/create', Component: ScheduleFormPage },
  { path: ':circleId/schedules/:scheduleId', Component: ScheduleDetailPage },
  { path: ':circleId/schedules/:scheduleId/edit', Component: ScheduleFormPage },
];
