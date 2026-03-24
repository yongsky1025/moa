const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: '대기',   cls: 'bg-amber-50 text-amber-600' },
  OPEN:     { label: '모집중', cls: 'bg-emerald-50 text-emerald-600' },
  FULL:     { label: '정원마감', cls: 'bg-blue-50 text-blue-600' },
  REJECTED: { label: '반려',   cls: 'bg-red-50 text-red-500' },
  CLOSED:   { label: '해산',   cls: 'bg-gray-100 text-gray-500' },
};

export default function AdminCircleStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
