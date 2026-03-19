// components/layout/AdminSidebar.tsx
// AdminDashboardPage 에서 사이드바 코드 추출 — 전체 어드민 공용

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  key:       string;
  label:     string;
  icon:      string;
  path?:     string;
  children?: { key: string; label: string; path: string }[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    key:   'dashboard',
    label: '대시보드',
    icon:  '⊞',
    path:  '/admin/maindashboard',
  },
  { key: 'users', label: '유저 관리', icon: '👥', path: '/admin/users' },
  {
    key:   'circles',
    label: '모임 관리',
    icon:  '◎',
    children: [
      { key: 'circles-pending', label: '생성 승인 대기', path: '/admin/circles/pending' },
      { key: 'circles-all',     label: '전체 모임 관리', path: '/admin/circles'         },
    ],
  },
  { key: 'posts',  label: '게시글 관리', icon: '📋', path: '/admin/posts'  },
  { key: 'places', label: '장소 관리',   icon: '📍', path: '/admin/places' },
  {
    key:   'reports',
    label: '신고 / 제재 관리',
    icon:  '🚩',
    children: [
      { key: 'reports-list',   label: '신고 확인', path: '/admin/reports'   },
      { key: 'sanctions-list', label: '제재 확인', path: '/admin/sanctions' },
    ],
  },
  { key: 'stats', label: '통계 리포트', icon: '📊', path: '/admin/stats' },
  {
    key:   'logs',
    label: '유저 활동 로그',
    icon:  '🗒',
    children: [
      { key: 'logs-all',  label: '전체 로그',      path: '/admin/logs'      },
      { key: 'logs-user', label: '특정 유저 로그', path: '/admin/logs/user' },
    ],
  },
];

// 구분선 표시할 인덱스
const DIVIDER_BEFORE = new Set([2, 5, 6]);

export default function AdminSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // 기본으로 열려있는 서브메뉴
  const [openMenus, setOpenMenus] = useState<Set<string>>(
    new Set(['circles', 'reports', 'logs'])
  );

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const isActive       = (path?: string) => !!path && location.pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some(c => location.pathname === c.path) ?? false;

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-64px)] w-55 shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white pt-4">

      {/* 로고 */}
      <div className="mb-2 border-b border-gray-100 px-4.5 pb-4">
        <p className="text-[15px] font-extrabold tracking-tight text-gray-900">
          MOA Admin
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400">관리자 패널</p>
      </div>

      {/* 메뉴 목록 */}
      {MENU_ITEMS.map((item, idx) => {
        const active  = isActive(item.path);
        const pActive = isParentActive(item);
        const open    = openMenus.has(item.key);

        return (
          <div key={item.key}>
            {DIVIDER_BEFORE.has(idx) && (
              <div className="mx-3 my-1.5 h-px bg-gray-100" />
            )}

            <button
              className={`sb-btn flex w-full cursor-pointer items-center justify-between border-l-[3px] px-4.5 py-2.25 text-left text-[13px] transition-all duration-150 ${
                active || pActive
                  ? 'font-bold'
                  : 'border-l-transparent bg-transparent font-normal'
              }`}
              style={
                active || pActive
                  ? { background: '#EAF4F0', borderLeftColor: '#5F8F7B', color: '#4E7C69' }
                  : { color: '#3D5F52' }
              }
              onClick={() =>
                item.children
                  ? toggleMenu(item.key)
                  : item.path && navigate(item.path)
              }
            >
              <span className="flex items-center gap-2">
                <span className="text-sm leading-none">{item.icon}</span>
                {item.label}
              </span>
              {item.children && (
                <span className={`text-[10px] text-gray-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              )}
            </button>

            {item.children && open && (
              <div className="pb-1">
                {item.children.map(child => (
                  <button
                    key={child.key}
                    className={`sb-sub block w-full cursor-pointer border-none py-1.75 pr-4.5 pl-10.5 text-left text-xs transition-colors duration-150 ${
                      isActive(child.path) ? 'font-semibold' : 'bg-transparent font-normal'
                    }`}
                    style={
                      isActive(child.path)
                        ? { background: '#EAF4F0', color: '#5F8F7B' }
                        : { color: '#6B7280' }
                    }
                    onClick={() => navigate(child.path)}
                  >
                    └ {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}