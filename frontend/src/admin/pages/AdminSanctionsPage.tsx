import { AdminSanctionsProvider, useAdminSanctions } from '../context/AdminSanctionsContext';
import AdminSanctionFilterBar from '../component/sanction/AdminSanctionFilterBar';
import AdminSanctionTable from '../component/sanction/AdminSanctionTable';

function Header() {
  const { data, refresh } = useAdminSanctions();
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
          <span className="text-white text-lg font-black">⛔</span>
        </div>
        <div>
          <h1 className="text-moa-text text-2xl font-bold tracking-tight">제재 확인</h1>
          <p className="text-moa-subtle mt-0.5 text-sm">
            전체 <span className="text-moa-primary font-bold">{totalCount.toLocaleString()}</span>건
          </p>
        </div>
      </div>
      <button
        onClick={refresh}
        className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all"
      >
        ↻ 새로고침
      </button>
    </div>
  );
}

export default function AdminSanctionsPage() {
  return (
    <AdminSanctionsProvider>
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <Header />
        <AdminSanctionFilterBar />
        <AdminSanctionTable />
      </div>
    </AdminSanctionsProvider>
  );
}

