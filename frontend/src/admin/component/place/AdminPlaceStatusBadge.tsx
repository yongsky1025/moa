const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:      { label: "운영중", cls: "bg-emerald-50 text-emerald-600" },
  INACTIVE:    { label: "비활성", cls: "bg-gray-100 text-gray-500" },
  MAINTENANCE: { label: "점검중", cls: "bg-amber-50 text-amber-600" },
};

export default function AdminPlaceStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
