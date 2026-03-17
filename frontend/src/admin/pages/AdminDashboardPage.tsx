import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';

import '../styles/dashboard.css';
import { useAdminMain } from '../hooks/UseAdminMain';
import { usePostActivity } from '../hooks/UsePostActivity';
import KpiCards from '../component/mainboard/KpiCards';
import GenderDonutCard from '../component/mainboard/GenderDonutCard';
import MonthlyTrendCard from '../component/mainboard/MonthlyTrendCard';
import CircleStatusCard from '../component/mainboard/CircleStatusCard';
import PostActivityCard from '../component/mainboard/PostActivityCard';
import QuickActionsCard from '../component/mainboard/QuickActionsCard';

// ─── 사이드바 메뉴 ────────────────────────────────────────────
interface MenuItem {
  key: string;
  label: string;
  icon: string;
  path?: string;
  children?: { key: string; label: string; path: string }[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'dashboard',
    label: '대시보드',
    icon: '⊞',
    path: '/admin/maindashboard',
  },
  { key: 'users', label: '유저 관리', icon: '👥', path: '/admin/users' },
  {
    key: 'circles',
    label: '모임 관리',
    icon: '◎',
    children: [
      {
        key: 'circles-pending',
        label: '생성 승인 대기',
        path: '/admin/circles/pending',
      },
      { key: 'circles-all', label: '전체 모임 관리', path: '/admin/circles' },
    ],
  },
  { key: 'posts', label: '게시글 관리', icon: '📋', path: '/admin/posts' },
  {
    key: 'places',
    label: '장소 관리',
    icon: '📍',
    path: '/admin/places',
  },
  {
    key: 'reports',
    label: '신고 / 제재 관리',
    icon: '🚩',
    children: [
      { key: 'reports-list', label: '신고 확인', path: '/admin/reports' },
      { key: 'sanctions-list', label: '제재 확인', path: '/admin/sanctions' },
    ],
  },
  { key: 'stats', label: '통계 리포트', icon: '📊', path: '/admin/stats' },
  {
    key: 'logs',
    label: '유저 활동 로그',
    icon: '🗒',
    children: [
      { key: 'logs-all', label: '전체 로그', path: '/admin/logs' },
      { key: 'logs-user', label: '특정 유저 로그', path: '/admin/logs/user' },
    ],
  },
];

const DIVIDER_BEFORE = new Set([2, 5, 6]);

interface AdminDashboardPageProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string;
}

// ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage({
  isLoggedIn = true,
  isAdmin = true,
  userName = '',
}: AdminDashboardPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<Set<string>>(
    new Set(['circles', 'reports', 'logs']),
  );

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const isActive = (path?: string) => !!path && location.pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname === c.path) ?? false;

  const {
    data: mainData,
    loading: mainLoading,
    error: mainError,
    refetch: refetchMain,
  } = useAdminMain();
  const { data: postData, loading: postLoading } = usePostActivity();
  const loading = mainLoading || postLoading;

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: '#FDFAF8' }}
    >
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={userName} />

      <div className="flex flex-1">
        {/* ── 사이드바 ──────────────────────────────── */}
        <aside className="sticky top-16 flex h-[calc(100vh-64px)] w-55 shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white pt-4">
          {/* 로고 */}
          <div className="mb-2 border-b border-gray-100 px-4.5 pb-4">
            <p className="text-[15px] font-extrabold tracking-tight text-gray-900">
              MOA Admin
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">관리자 패널</p>
          </div>

          {MENU_ITEMS.map((item, idx) => {
            const active = isActive(item.path);
            const pActive = isParentActive(item);
            const open = openMenus.has(item.key);

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
                      ? {
                          background: '#FDF0E8',
                          borderLeftColor: '#D07856',
                          color: '#B8643D',
                        }
                      : {
                          color: '#6B4F3A',
                        }
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
                    <span
                      className={`text-[10px] text-gray-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  )}
                </button>

                {item.children && open && (
                  <div className="pb-1">
                    {item.children.map((child) => (
                      <button
                        key={child.key}
                        className={`sb-sub block w-full cursor-pointer border-none py-1.75 pr-4.5 pl-10.5 text-left text-xs transition-colors duration-150 ${
                          isActive(child.path)
                            ? 'font-semibold'
                            : 'bg-transparent font-normal'
                        }`}
                        style={
                          isActive(child.path)
                            ? { background: '#FDF0E8', color: '#D07856' }
                            : { color: '#9B7B6A' }
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

        {/* ── 메인 콘텐츠 ───────────────────────────── */}
        <main className="min-w-0 flex-1 px-7 pt-8 pb-16">
          {/* 헤더 */}
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h1
                className="mb-1 text-2xl font-black tracking-tight"
                style={{ color: '#262626' }}
              >
                관리자 대시보드
              </h1>
              <p className="text-sm" style={{ color: '#9B7B6A' }}>
                moa 서비스 관리 현황
              </p>
            </div>
            <button
              onClick={refetchMain}
              className="refetch-btn flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#F2E8E0] bg-white px-3.5 py-1.75 text-xs text-[#9B7B6A] transition-colors duration-150 hover:bg-[#FDF0E8]"
            >
              ↻ 새로고침
            </button>
          </div>

          {/* 에러 배너 */}
          {mainError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              ⚠️ 데이터를 불러오지 못했습니다 — {mainError}
            </div>
          )}

          {/* Row 1: KPI 6개 */}
          <KpiCards mainData={mainData} postData={postData} loading={loading} />

          {/* Row 2: 성비 + 사용자 증감 추이 */}
          <div className="mb-4 grid grid-cols-[1fr_2.4fr] gap-3.5">
            <GenderDonutCard
              data={mainData?.userCountDTO ?? null}
              loading={mainLoading}
            />
            <MonthlyTrendCard
              data={mainData?.dashboardChartDTO ?? null}
              loading={mainLoading}
            />
          </div>

          {/* Row 3: 모임 현황 + 게시글 활동 */}
          <div className="mb-4 grid grid-cols-[1.4fr_1fr] gap-3.5">
            <CircleStatusCard
              circleData={mainData?.circleSummaryDTO ?? null}
              userData={mainData?.userCountDTO ?? null}
              loading={mainLoading}
            />
            <PostActivityCard data={postData} loading={postLoading} />
          </div>

          {/* Row 4: 빠른 작업 */}
          <QuickActionsCard />
        </main>
      </div>

      <Footer />
    </div>
  );
}
