/**
 * MOA Navbar Component
 * Design: Golden Afternoon Hygge - Warm ivory top nav
 * Features: 모임찾기, 커뮤니티, 에너지테스트, 알림, 로그인/로그아웃
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface NavbarProps {
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  userName?: string;
}

export default function Navbar({
  isAdmin = false,
  isLoggedIn = false,
  userName = '',
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '모임 찾기', path: '/gathering', icon: '🔍' },
    { label: '커뮤니티', path: '/community', icon: '💬' },
    { label: '에너지 테스트', path: '/energy-test', icon: '⚡' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const mockNotifications = [
    {
      id: 1,
      text: "독서모임 '책벌레들'에서 새 공지가 올라왔어요.",
      time: '5분 전',
      unread: true,
    },
    {
      id: 2,
      text: "에너지 매칭: 새로운 모임 '수채화 그리기'를 추천드려요!",
      time: '1시간 전',
      unread: true,
    },
    {
      id: 3,
      text: "내일 오후 3시 '조용한 카페 모임' 일정을 잊지 마세요.",
      time: '3시간 전',
      unread: false,
    },
  ];

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled
          ? 'oklch(0.985 0.012 80 / 0.95)'
          : 'oklch(0.985 0.012 80 / 0.98)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid oklch(0.88 0.02 75 / ${scrolled ? '0.8' : '0.5'})`,
        boxShadow: scrolled ? '0 2px 20px oklch(0.28 0.05 55 / 0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/main')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663408313920/fypaDX6SmaoURVPotYREyB/moa-logo-icon-4GZ8pWmPxcRPenYiURWzgQ.webp"
            alt="MOA"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.35rem',
              color: 'oklch(0.62 0.14 42)',
              letterSpacing: '0.05em',
            }}
          >
            MOA
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                background: isActive(link.path)
                  ? 'oklch(0.62 0.14 42 / 0.1)'
                  : 'none',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.5rem 1.1rem',
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontWeight: isActive(link.path) ? 600 : 400,
                fontSize: '0.9rem',
                color: isActive(link.path)
                  ? 'oklch(0.62 0.14 42)'
                  : 'oklch(0.45 0.04 65)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.path)) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'oklch(0.62 0.14 42 / 0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'oklch(0.62 0.14 42)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.path)) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'none';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'oklch(0.45 0.04 65)';
                }
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>{link.icon}</span>
              {link.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/maindashboard')}
              style={{
                background: isActive('/admin')
                  ? 'oklch(0.52 0.07 130 / 0.12)'
                  : 'none',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.5rem 1.1rem',
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontWeight: isActive('/admin') ? 600 : 400,
                fontSize: '0.9rem',
                color: isActive('/admin')
                  ? 'oklch(0.52 0.07 130)'
                  : 'oklch(0.45 0.04 65)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>⚙️</span>
              관리자
            </button>
          )}
        </div>

        {/* Right: Notifications + Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'oklch(0.45 0.04 65)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'oklch(0.62 0.14 42 / 0.08)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'oklch(0.62 0.14 42)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'none';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'oklch(0.45 0.04 65)';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Unread badge */}
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'oklch(0.62 0.14 42)',
                  border: '2px solid oklch(0.985 0.012 80)',
                }}
              />
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  background: 'oklch(0.985 0.012 80)',
                  border: '1px solid oklch(0.88 0.02 75)',
                  borderRadius: '1rem',
                  boxShadow: '0 8px 32px oklch(0.28 0.05 55 / 0.12)',
                  overflow: 'hidden',
                  zIndex: 200,
                  animation: 'fadeInUp 0.2s ease forwards',
                }}
              >
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid oklch(0.88 0.02 75)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'oklch(0.28 0.05 55)',
                    }}
                  >
                    알림
                  </span>
                  <span
                    style={{
                      background: 'oklch(0.62 0.14 42)',
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '0.1rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    2 새 알림
                  </span>
                </div>
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '0.9rem 1.25rem',
                      borderBottom: '1px solid oklch(0.88 0.02 75 / 0.5)',
                      background: notif.unread
                        ? 'oklch(0.62 0.14 42 / 0.04)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        'oklch(0.62 0.14 42 / 0.07)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        notif.unread
                          ? 'oklch(0.62 0.14 42 / 0.04)'
                          : 'transparent';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      {notif.unread && (
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'oklch(0.62 0.14 42)',
                            marginTop: '5px',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: '0.82rem',
                            color: 'oklch(0.35 0.04 55)',
                            lineHeight: 1.5,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {notif.text}
                        </p>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '0.72rem',
                            color: 'oklch(0.6 0.03 65)',
                          }}
                        >
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      navigate('/notifications');
                      setNotifOpen(false);
                    }}
                    style={{
                      fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                      fontSize: '0.82rem',
                      color: 'oklch(0.62 0.14 42)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    모든 알림 보기 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Auth buttons */}
          {isLoggedIn ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <button
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'oklch(0.62 0.14 42 / 0.08)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.4rem 1rem 0.4rem 0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'oklch(0.62 0.14 42 / 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'oklch(0.62 0.14 42 / 0.08)';
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'oklch(0.62 0.14 42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {userName.charAt(0) || 'U'}
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'oklch(0.35 0.04 55)',
                  }}
                >
                  {userName || '내 프로필'}
                </span>
              </button>
              <button
                onClick={() => {
                  toast.success('로그아웃 되었습니다.');
                  navigate('/');
                }}
                style={{
                  background: 'none',
                  border: '1px solid oklch(0.88 0.02 75)',
                  borderRadius: '9999px',
                  padding: '0.45rem 1rem',
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                  fontSize: '0.85rem',
                  color: 'oklch(0.52 0.04 65)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'oklch(0.62 0.14 42)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'oklch(0.62 0.14 42)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'oklch(0.88 0.02 75)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'oklch(0.52 0.04 65)';
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: '1px solid oklch(0.88 0.02 75)',
                  borderRadius: '9999px',
                  padding: '0.5rem 1.2rem',
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                  fontSize: '0.88rem',
                  color: 'oklch(0.45 0.04 65)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'oklch(0.62 0.14 42)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'oklch(0.62 0.14 42)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'oklch(0.88 0.02 75)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'oklch(0.45 0.04 65)';
                }}
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'oklch(0.62 0.14 42)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.5rem 1.2rem',
                  fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'oklch(0.972 0.018 85)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'oklch(0.55 0.13 42)';
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'oklch(0.62 0.14 42)';
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    'translateY(0)';
                }}
              >
                회원가입
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'oklch(0.45 0.04 65)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: 'oklch(0.985 0.012 80)',
            borderTop: '1px solid oklch(0.88 0.02 75)',
            padding: '1rem 1.5rem 1.5rem',
            animation: 'fadeInUp 0.2s ease forwards',
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                background: isActive(link.path)
                  ? 'oklch(0.62 0.14 42 / 0.08)'
                  : 'none',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontWeight: isActive(link.path) ? 600 : 400,
                fontSize: '0.95rem',
                color: isActive(link.path)
                  ? 'oklch(0.62 0.14 42)'
                  : 'oklch(0.35 0.04 55)',
                cursor: 'pointer',
                marginBottom: '0.25rem',
                textAlign: 'left',
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </button>
          ))}
          <div
            style={{
              borderTop: '1px solid oklch(0.88 0.02 75)',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <button
              onClick={() => {
                navigate('/login');
                setMobileOpen(false);
              }}
              style={{
                flex: 1,
                background: 'none',
                border: '1px solid oklch(0.88 0.02 75)',
                borderRadius: '9999px',
                padding: '0.65rem',
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontSize: '0.9rem',
                color: 'oklch(0.45 0.04 65)',
                cursor: 'pointer',
              }}
            >
              로그인
            </button>
            <button
              onClick={() => {
                navigate('/register');
                setMobileOpen(false);
              }}
              style={{
                flex: 1,
                background: 'oklch(0.62 0.14 42)',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.65rem',
                fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'oklch(0.972 0.018 85)',
                cursor: 'pointer',
              }}
            >
              회원가입
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
