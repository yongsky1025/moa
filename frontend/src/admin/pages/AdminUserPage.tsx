import AdminUserFilterBar from '../component/adminUsers/AdminUserFilterbar';
import AdminUserTable from '../component/adminUsers/AdminUserTable';
import {
  AdminUsersProvider,
  useAdminUserList,
} from '../context/AdminUsersContext';

function AdminUserPageHeader() {
  const { totalCount, refresh } = useAdminUserList();
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-moa-text text-2xl font-bold tracking-tight">
            유저 관리
          </h1>
          <p className="text-moa-subtle mt-0.5 text-sm">
            전체{' '}
            <span className="text-moa-primary font-bold">
              {totalCount.toLocaleString()}
            </span>
            명
          </p>
        </div>
      </div>
      <button
        onClick={refresh}
        className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        새로고침
      </button>
    </div>
  );
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────────
// AdminUserListProvider가 Context를 공급
// 내부 컴포넌트들은 모두 useUserList()로 직접 꺼내 씀 — props 전달 없음

export default function AdminUsersPage() {
  return (
    <AdminUsersProvider>
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <AdminUserPageHeader />
        {/* <AdminUserSummaryCards /> */}
        <AdminUserFilterBar />
        <AdminUserTable />
      </div>
    </AdminUsersProvider>
  );
}
