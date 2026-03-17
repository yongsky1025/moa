import AdminDashboardPage from '../admin/pages/AdminDashboardPage';
import AdminUsersPage from '../admin/pages/AdminUserPage';

export const adminRouter = () => {
  return [
    { path: 'maindashboard', Component: AdminDashboardPage },
    { path: 'users', Component: AdminUsersPage },
  ];
};
