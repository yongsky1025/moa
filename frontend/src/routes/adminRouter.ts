import AdminLayout from '../admin/component/AdminLayout';
import AdminDashboardPage from '../admin/pages/AdminDashboardPage';
import AdminUsersPage from '../admin/pages/AdminUserPage';

export const adminRouter = () => {
  return [
    {
      // ★ AdminLayout이 Navbar + Sidebar + Footer 담당
      // 자식 라우트들은 <Outlet /> 자리에 렌더링됨
      Component: AdminLayout,
      children: [
        { path: 'maindashboard', Component: AdminDashboardPage },
        { path: 'users',         Component: AdminUsersPage      },
        // 추후 추가
        // { path: 'circles',        Component: AdminCirclesPage   },
        // { path: 'circles/pending', Component: AdminCirclesPendingPage },
        // { path: 'posts',          Component: AdminPostsPage     },
        // { path: 'places',         Component: AdminPlacesPage    },
        // { path: 'reports',        Component: AdminReportsPage   },
        // { path: 'sanctions',      Component: AdminSanctionsPage },
        // { path: 'stats',          Component: AdminStatsPage     },
        // { path: 'logs',           Component: AdminLogsPage      },
        // { path: 'logs/user',      Component: AdminLogsUserPage  },
      ],
    },
  ];
};
