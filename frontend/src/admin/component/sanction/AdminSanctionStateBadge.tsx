import type { SanctionState } from '../../types/adminTypes';

const STYLES: Record<SanctionState, { label: string; cls: string; dot: string }> = {
  ACTIVE: { label: '활성', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  LIFTED: { label: '해제', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  CANCELLED: { label: '취소', cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
};

export default function AdminSanctionStateBadge({ state }: { state: SanctionState }) {
  const s = STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

