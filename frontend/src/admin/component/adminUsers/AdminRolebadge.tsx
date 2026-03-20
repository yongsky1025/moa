import type { UserRole } from '../../types/adminTypes';

export default function AdminRoleBadge({ role }: { role: UserRole }) {
  if (role !== 'ADMIN') return null;
  return (
    <span className="bg-moa-primary inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold text-white">
      관리자
    </span>
  );
}
