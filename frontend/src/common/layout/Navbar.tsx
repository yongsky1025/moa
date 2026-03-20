import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../users/reducers/authSlice';
import type { AppDispatch, RootState } from '../../users/reducers/store';
import { notificationApi } from '../../api/notificationApi';
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
  '에너지 테스트': [
    { label: '테스트 시작', href: '#' },
    { label: '에너지 유형 소개', href: '#' },
    { label: '결과 공유', href: '#' },
  ],
  '내 에너지': [
    { label: '내 결과 보기', href: '#' },
    { label: '에너지 유형 소개', href: '#' },
    { label: '결과 공유', href: '#' },
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

  useEffect(() => {
    if (!isLoggedIn) { setUnreadChatCount(0); return; }
    const fetch = () => {
      notificationApi.getAll().then((list) => {
        setUnreadChatCount(list.filter((n) => n.type === 'CHAT_MESSAGE' && !n.isRead).length);
      }).catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [isLoggedIn]);

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
    '에너지 테스트': '#',
    '내 에너지': '#',
    '장소 추천': '#',
    '관리자 페이지': '/admin',
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
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
            to="/"
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

            {/* 채팅 아이콘 - 프로필 옆 */}
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
