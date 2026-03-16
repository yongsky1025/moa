import AdminDashboardPage from '../admin/pages/AdminDashboardPage';

export const adminRouter = () => {
  return [{ path: 'maindashboard', Component: AdminDashboardPage }];
};
