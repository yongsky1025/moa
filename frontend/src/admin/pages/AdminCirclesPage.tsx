import { AdminCirclesProvider, useAdminCircles } from '../context/AdminCirclesContext';
import AdminPopularCircles from '../component/circle/AdminPopularCircles';
import AdminCircleFilterBar from '../component/circle/AdminCircleFilterBar';
import AdminCircleTable from '../component/circle/AdminCircleTable';

function Header() {
  const { data, refresh } = useAdminCircles();
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
          <span className="text-lg text-white">◎</span>
        </div>
        <div>
          <h1 className="text-moa-text text-2xl font-bold tracking-tight">전체 모임 관리</h1>
          <p className="text-moa-subtle mt-0.5 text-sm">
            전체 <span className="text-moa-primary font-bold">{totalCount.toLocaleString()}</span>개
          </p>
        </div>
      </div>
      <button
        onClick={refresh}
        className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all cursor-pointer"
      >
        ↻ 새로고침
      </button>
    </div>
  );
}

export default function AdminCirclesPage() {
  return (
    <AdminCirclesProvider>
      <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
        <Header />
        <AdminPopularCircles />
        <AdminCircleFilterBar />
        <AdminCircleTable />
      </div>
    </AdminCirclesProvider>
  );
}
