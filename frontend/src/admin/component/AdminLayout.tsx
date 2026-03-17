// components/layout/AdminLayout.tsx
// 모든 어드민 페이지 공용 레이아웃
// Navbar, AdminSidebar, Footer는 이미 컴포넌트화 되어있음
// <Outlet /> 자리에 각 어드민 페이지가 렌더링됨

import { Outlet } from 'react-router-dom';
import Navbar      from '../../common/layout/Navbar';
import Footer      from '../../common/layout/Footer';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  isLoggedIn?: boolean;
  isAdmin?:    boolean;
  userName?:   string;
}

export default function AdminLayout({
  isLoggedIn = true,
  isAdmin    = true,
  userName   = '',
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#FDFAF8' }}>

      {/* 상단 Navbar — 기존 컴포넌트 그대로 */}
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={userName} />

      <div className="flex flex-1">
        {/* 사이드바 — 추출한 컴포넌트 */}
        <AdminSidebar />

        {/* 페이지 콘텐츠 — 각 라우트 컴포넌트가 여기 렌더링 */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 하단 Footer — 기존 컴포넌트 그대로 */}
      <Footer />
    </div>
  );
}