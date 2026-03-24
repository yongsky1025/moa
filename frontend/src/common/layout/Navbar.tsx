import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../users/reducers/authSlice';
import type { AppDispatch, RootState } from '../../users/reducers/store';
import { notificationApi } from '../../api/notificationApi';
import type { Notification } from '../../types/notification';
import FloatingChatWindow from '../../chat/components/FloatingChatWindow';

const dropdownItems: Record<string, { label: string; href: string }[]> = {
  '모임 찾기': [
    { label: '전체 모임', href: '/circle' },
    { label: '내 모임', href: '/circle/my' },
  ],
  커뮤니티: [
    { label: '자유게시판', href: '#' },
    { label: '모임 후기', href: '#' },
    { label: 'Q&A', href: '#' },
    { label: '공지사항', href: '#' },
  ],
  '에너지 테스트': [{ label: '테스트 시작', href: '/users/energy-test' }],
  '내 에너지': [
    { label: '내 결과 보기', href: '/users/energy-test/result' },
    { label: '테스트 다시 하기', href: '/users/energy-test?mode=retest' },
  ],
};

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((s: RootState) => s.auth);
  const isAdmin = user?.userRole === 'ADMIN';

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activityNoti, setActivityNoti] = useState<Notification[]>([]);
  const [showActivityNoti, setShowActivityNoti] = useState(false);
  const activityNotiRef = useRef<HTMLDivElement>(null);

  const unreadActivityCount = activityNoti.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!isLoggedIn) { setUnreadChatCount(0); setActivityNoti([]); return; }
    const fetch = () => {
      notificationApi.getAll().then((list) => {
        setUnreadChatCount(list.filter((n) => n.type === 'CHAT_MESSAGE' && !n.isRead).length);
        setActivityNoti(list.filter((n) => n.type !== 'CHAT_MESSAGE'));
      }).catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [isLoggedIn]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (activityNotiRef.current && !activityNotiRef.current.contains(e.target as Node)) {
        setShowActivityNoti(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleActivityNotiClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationApi.readOne(n.id);
      setActivityNoti((p) => p.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    setShowActivityNoti(false);
    navigate('/circle/my');
  };

  const ACTIVITY_NOTI_ICONS: Record<string, string> = {
    JOIN_REQUEST: '📨',
    JOIN_APPROVED: '✅',
    JOIN_REJECTED: '❌',
    KICKED: '🚫',
    CIRCLE_DISBANDED: '💔',
  };

  const navItems = [
    '관리자 페이지',
    '모임 찾기',
    '커뮤니티',
    isLoggedIn ? '내 에너지' : '에너지 테스트',
    '장소 추천',
  ];

  const navLinks: Record<string, string> = {
    '모임 찾기': '/circle',
    커뮤니티: '#',
    '에너지 테스트': '/users/energy-test',
    '내 에너지': '/users/energy-test/result',
    '장소 추천': '#',
    '관리자 페이지': '/admin',
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/main');
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 20px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/main"
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: -0.5,
              color: '#111',
              textDecoration: 'none',
            }}
          >
            moa
          </Link>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginLeft: 'auto',
              marginRight: 24,
            }}
          >
            <nav style={{ display: 'flex', gap: 24 }}>
              {navItems.map((item) => (
                <div
                  key={item}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to={navLinks[item] ?? '#'}
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: hoveredItem === item ? '#5F8F7B' : '#555',
                      textDecoration: 'none',
                      display: 'inline-block',
                      textAlign: 'center',
                      width: 76,
                      whiteSpace: 'nowrap',
                      lineHeight: '60px',
                      transition: 'color 0.15s',
                      visibility:
                        item === '관리자 페이지' && !isAdmin ? 'hidden' : 'visible',
                      pointerEvents:
                        item === '관리자 페이지' && !isAdmin ? 'none' : 'auto',
                    }}
                  >
                    {item}
                  </Link>
                  {hoveredItem === item && dropdownItems[item]?.length && (
                    <div
                      className="dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 1px)',
                        left: 0,
                        backgroundColor: 'white',
                        border: '1px solid #f0f0f0',
                        borderRadius: 0,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                        padding: '4px 0',
                        minWidth: 96,
                        zIndex: 100,
                      }}
                    >
                      {dropdownItems[item]?.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: 36,
                            padding: '0 14px',
                            fontSize: 13,
                            color: '#444',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#f7f7f8')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 68 }}>
              <button
                onClick={isLoggedIn ? handleLogout : () => navigate('/users/login')}
                style={{
                  padding: '5px 0',
                  width: '100%',
                  borderRadius: 6,
                  border: '1px solid #5F8F7B',
                  background: 'transparent',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: '#5F8F7B',
                }}
              >
                {isLoggedIn ? '로그아웃' : '로그인'}
              </button>
            </div>

            {isLoggedIn && (
              <div ref={activityNotiRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowActivityNoti((v) => !v)}
                  title="활동 알림"
                  style={{
                    width: 34, height: 34, borderRadius: '50%', border: 'none',
                    backgroundColor: '#5F8F7B', color: '#fff', fontSize: 18,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  🔔
                </button>
                {unreadActivityCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    backgroundColor: '#ef4444', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    {unreadActivityCount > 99 ? '99+' : unreadActivityCount}
                  </span>
                )}
                {showActivityNoti && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 300, background: '#fff', borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>활동 알림</span>
                      <button
                        onClick={async () => {
                          const ids = activityNoti.filter((n) => !n.isRead).map((n) => n.id);
                          if (ids.length === 0) return;
                          await notificationApi.readAll();
                          setActivityNoti((p) => p.map((n) => ({ ...n, isRead: true })));
                        }}
                        style={{ background: 'none', border: 'none', fontSize: 12, color: '#5F8F7B', cursor: 'pointer', fontWeight: 600 }}
                      >
                        전체 읽음
                      </button>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {activityNoti.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13 }}>알림 없음</p>
                      ) : (
                        activityNoti.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleActivityNotiClick(n)}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              padding: '10px 16px', cursor: 'pointer',
                              background: n.isRead ? '#fff' : '#EAF4F0',
                              borderBottom: '1px solid #F3F4F6',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? '#fff' : '#EAF4F0')}
                          >
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{ACTIVITY_NOTI_ICONS[n.type] ?? '🔔'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, color: '#1F2937', lineHeight: 1.4 }}>{n.message}</p>
                              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                                {new Date(n.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5F8F7B', flexShrink: 0, marginTop: 4 }} />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoggedIn && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setChatOpen((v) => !v)}
                  title="채팅"
                  style={{
                    width: 34, height: 34, borderRadius: '50%', border: 'none',
                    backgroundColor: '#5F8F7B', color: '#fff', fontSize: 18,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  💬
                </button>
                {unreadChatCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    backgroundColor: '#ef4444', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                width: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLoggedIn ? (
                <div
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    backgroundColor: '#5F8F7B', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/users/signup')}
                  style={{
                    padding: '5px 0', width: '100%', borderRadius: 6,
                    border: 'none', background: '#5F8F7B', color: '#fff',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  회원가입
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {isLoggedIn && <FloatingChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />}
    </>
  );
}
