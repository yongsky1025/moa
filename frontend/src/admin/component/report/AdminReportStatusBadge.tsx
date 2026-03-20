import type { ReportStatus } from '../../types/adminTypes';

const STYLES: Record<ReportStatus, { label: string; cls: string; dot: string }> = {
  PENDING: { label: '대기', cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  REVIEWING: { label: '검토중', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  RESOLVED: { label: '승인', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  REJECTED: { label: '반려', cls: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
};

export default function AdminReportStatusBadge({ status }: { status: ReportStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

