import CircleListPage from '../circle/pages/CircleListPage';
import MyCirclesPage from '../circle/pages/MyCirclesPage';
import CircleDetailPage from '../circle/pages/CircleDetailPage';
import CircleFormPage from '../circle/pages/CircleFormPage';
import ScheduleListPage from '../schedule/pages/ScheduleListPage';
import ScheduleDetailPage from '../schedule/pages/ScheduleDetailPage';
import ScheduleFormPage from '../schedule/pages/ScheduleFormPage';

export const circleRouter = () => [
  { index: true, Component: CircleListPage },
  { path: 'my', Component: MyCirclesPage },
  { path: 'create', Component: CircleFormPage },
  { path: ':circleId', Component: CircleDetailPage },
  { path: ':circleId/edit', Component: CircleFormPage },
  { path: ':circleId/schedules', Component: ScheduleListPage },
  { path: ':circleId/schedules/create', Component: ScheduleFormPage },
  { path: ':circleId/schedules/:scheduleId', Component: ScheduleDetailPage },
  { path: ':circleId/schedules/:scheduleId/edit', Component: ScheduleFormPage },
];
