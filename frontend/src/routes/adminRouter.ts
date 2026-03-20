import AdminLayout from "../admin/component/AdminLayout";
import AdminDashboardPage from "../admin/pages/AdminDashboardPage";
import AdminUsersPage from "../admin/pages/AdminUserPage";
import AdminUserDetailPage from "../admin/pages/AdminUserDetailPage.tsx";
import AdminReportsPage from "../admin/pages/AdminReportsPage";
import AdminReportDetailPage from "../admin/pages/AdminReportDetailPage";
import AdminSanctionsPage from "../admin/pages/AdminSanctionsPage";
import AdminSanctionDetailPage from "../admin/pages/AdminSanctionDetailPage";
import AdminStatsPage from "../admin/pages/AdminStatsPage";
import AdminLogsPage from "../admin/pages/AdminLogsPage";
import AdminUserLogsPage from "../admin/pages/AdminUserLogsPage";
import AdminCirclesPage from "../admin/pages/AdminCirclesPage";
import AdminCirclesPendingPage from "../admin/pages/AdminCirclesPendingPage";
import AdminCircleDetailPage from "../admin/pages/AdminCircleDetailPage";
import AdminCircleCategoryPage from "../admin/pages/AdminCircleCategoryPage";
import AdminPostsPage from "../admin/pages/AdminPostsPage";
import AdminPostDetailPage from "../admin/pages/AdminPostDetailPage";
import AdminNoticesPage from "../admin/pages/AdminNoticesPage";
import AdminNoticeWritePage from "../admin/pages/AdminNoticeWritePage";
import AdminNoticeEditPage from "../admin/pages/AdminNoticeEditPage";

export const adminRouter = () => {
  return [
    {
      // AdminLayout이 Navbar + Sidebar + Footer 담당
      // 자식 라우트들은 <Outlet /> 자리에 렌더링됨
      Component: AdminLayout,
      children: [
        { path: "maindashboard", Component: AdminDashboardPage },
        { path: "users", Component: AdminUsersPage },
        { path: "users/profile/:id", Component: AdminUserDetailPage },
        { path: "posts", Component: AdminPostsPage },
        { path: "posts/:postId", Component: AdminPostDetailPage },
        { path: "posts/notices", Component: AdminNoticesPage },
        { path: "posts/notices/write", Component: AdminNoticeWritePage },
        { path: "posts/notices/:postId/edit", Component: AdminNoticeEditPage },
        { path: "reports", Component: AdminReportsPage },
        { path: "reports/:id", Component: AdminReportDetailPage },
        { path: "sanctions", Component: AdminSanctionsPage },
        { path: "sanctions/:id", Component: AdminSanctionDetailPage },
        { path: "stats", Component: AdminStatsPage },
        { path: "logs", Component: AdminLogsPage },
        { path: "logs/user", Component: AdminUserLogsPage },
        { path: "circles", Component: AdminCirclesPage },
        { path: "circles/pending", Component: AdminCirclesPendingPage },
        { path: "circles/category", Component: AdminCircleCategoryPage },
        { path: "circles/:id", Component: AdminCircleDetailPage },
        // 추후 추가
        // { path: 'places',         Component: AdminPlacesPage    },
      ],
    },
  ];
};
