import AdminDashboardPage from '../admin/component/AdminDashboardPage.tsx';

export const adminRouter = () => {
  return [{ path: 'maindashboard', Component: AdminDashboardPage }];
};
