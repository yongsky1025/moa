import { useAdminUserList } from '../../context/AdminUsersContext';
import type { UserStatus } from '../../types/adminTypes';

const CARDS: {
  label: string;
  status: UserStatus | '';
  numColor: string;
  activeStyle: string;
  deco: string;
}[] = [
  {
    label: '전체 유저',
    status: '',
    numColor: 'text-moa-primary',
    activeStyle: 'border-moa-primary bg-moa-primary',
    deco: 'bg-moa-muted',
  },
  {
    label: '활성',
    status: 'ACTIVE',
    numColor: 'text-moa-muted',
    activeStyle: 'border-moa-muted   bg-moa-muted',
    deco: 'bg-moa-muted',
  },
  {
    label: '정지',
    status: 'SUSPENDED',
    numColor: 'text-amber-500',
    activeStyle: 'border-amber-400   bg-amber-400',
    deco: 'bg-amber-300',
  },
  {
    label: '영구정지',
    status: 'BANNED',
    numColor: 'text-red-500',
    activeStyle: 'border-red-500     bg-red-500',
    deco: 'bg-red-300',
  },
];

export default function AdminUserSummaryCards() {
  const { totalCount, params, applyFilter } = useAdminUserList();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((card) => {
        const isActive = (params.status ?? '') === card.status;
        return (
          <button
            key={card.label}
            onClick={() => applyFilter({ status: card.status || undefined })}
            className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left shadow-sm transition-all ${
              isActive
                ? `${card.activeStyle} text-white shadow-lg`
                : 'border-moa-border hover:border-moa-primary bg-white hover:shadow-md'
            }`}
          >
            <div
              className={`mb-2 text-xs font-semibold tracking-wider uppercase ${isActive ? 'text-white/70' : 'text-moa-subtle'}`}
            >
              {card.label}
            </div>
            <div
              className={`mb-1 text-3xl font-black ${isActive ? 'text-white' : card.numColor}`}
            >
              {card.status === '' ? totalCount.toLocaleString() : '—'}
            </div>
            <div
              className={`text-xs ${isActive ? 'text-white/60' : 'text-moa-subtle'}`}
            >
              {card.status === '' ? '명 등록' : card.status}
            </div>
            <div
              className={`absolute -right-3 -bottom-3 h-16 w-16 rounded-full opacity-20 ${card.deco}`}
            />
          </button>
        );
      })}
    </div>
  );
}
