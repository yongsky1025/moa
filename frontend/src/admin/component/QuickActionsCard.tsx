import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { icon: '👥', label: '유저 관리',    path: '/admin/users' },
  { icon: '⏳', label: '승인 대기',    path: '/admin/circles/pending' },
  { icon: '📋', label: '게시글 관리', path: '/admin/posts' },
  { icon: '🚩', label: '신고 확인',   path: '/admin/reports' },
  { icon: '⛔', label: '제재 확인',   path: '/admin/sanctions' },
  { icon: '◎',  label: '전체 모임',   path: '/admin/circles' },
  { icon: '📊', label: '통계 리포트', path: '/admin/stats' },
  { icon: '🗒', label: '활동 로그',   path: '/admin/logs' },
];

export default function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <div className="admin-card">
      <h3 className="admin-card-title">빠른 작업</h3>
      <div className="grid grid-cols-8 gap-2.5">
        {ACTIONS.map(action => (
          <button key={action.path}
            onClick={() => navigate(action.path)}
            className="qa-btn bg-gray-50 border border-gray-100 rounded-xl
                       py-3.5 px-2 text-center cursor-pointer
                       hover:bg-blue-50 hover:border-blue-200 transition-all duration-150"
          >
            <div className="text-xl mb-1.5">{action.icon}</div>
            <div className="text-[11px] text-gray-500 leading-tight">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
