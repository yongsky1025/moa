import { useAdminUserDetail, type UserHistoryKind } from '../../context/AdminUserDetailContext';

function StatButton({
  label,
  value,
  kind,
  tint,
}: {
  label: string;
  value: number;
  kind: UserHistoryKind;
  tint: 'amber' | 'sky' | 'violet';
}) {
  const { openHistory } = useAdminUserDetail();

  const tintCls =
    tint === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
      : tint === 'sky'
        ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
        : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100';

  return (
    <button
      onClick={() => openHistory(kind)}
      className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${tintCls}`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</span>
        <span className="truncate text-sm font-semibold opacity-90">이력보기</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-moa-text text-2xl font-black">{value.toLocaleString()}</span>
        <span className="text-moa-subtle transition-transform group-hover:translate-x-0.5">›</span>
      </div>
    </button>
  );
}

export default function AdminUserActivityStatsCard({
  counts,
}: {
  counts: { posts: number; replies: number; circles: number };
}) {
  return (
    <section className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b border-moa-border px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-moa-primary" />
          <h2 className="text-moa-text text-sm font-black tracking-tight">활동 통계</h2>
        </div>
        <p className="text-moa-subtle mt-1 text-xs">항목을 클릭하면 이력(페이징)을 확인할 수 있어요.</p>
      </div>

      <div className="grid gap-3 p-6">
        <StatButton label="게시글" value={counts.posts} kind="post" tint="amber" />
        <StatButton label="댓글" value={counts.replies} kind="reply" tint="sky" />
        <StatButton label="가입 모임" value={counts.circles} kind="circle" tint="violet" />
      </div>
    </section>
  );
}

