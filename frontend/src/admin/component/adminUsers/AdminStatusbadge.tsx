import type { UserStatus } from '../../types/adminTypes';

const STATUS_META: Record<
  UserStatus,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    ring: string;
  }
> = {
  ACTIVE: {
    label: '활성',
    bg: 'bg-moa-light',
    text: 'text-moa-primary',
    dot: 'bg-moa-primary',
    ring: 'ring-moa-border',
  },
  SUSPENDED: {
    label: '정지',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    ring: 'ring-amber-200',
  },
  BANNED: {
    label: '영구정지',
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    ring: 'ring-red-200',
  },
  WITHDRAWN: {
    label: '탈퇴',
    bg: 'bg-moa-border',
    text: 'text-moa-subtle',
    dot: 'bg-moa-subtle',
    ring: 'ring-moa-border',
  },
};

export default function AdminStatusBadge({ status }: { status: UserStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.bg} ${m.text} ${m.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
