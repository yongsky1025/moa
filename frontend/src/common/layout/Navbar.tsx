import React, { useState, useEffect, useRef } from "react";
import { Bell, MessageCircle, LayoutGrid, Users, MessageSquare, Star, HelpCircle, Megaphone, User, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { notificationApi } from "../../api/notificationApi";
import type { Notification } from "../../types/notification";
import FloatingChatWindow from "../../chat/components/FloatingChatWindow";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";

  const dropdownItems: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
    "모임 찾기": [
      { label: "전체 모임", href: "/circle", icon: <LayoutGrid size={15} /> },
      { label: "내 모임", href: "/circle/my", icon: <Users size={15} /> },
    ],
    커뮤니티: [
      { label: "자유게시판", href: "#", icon: <MessageSquare size={15} /> },
      { label: "모임 후기", href: "#", icon: <Star size={15} /> },
      { label: "Q&A", href: "#", icon: <HelpCircle size={15} /> },
      { label: "공지사항", href: "#", icon: <Megaphone size={15} /> },
    ],
  };

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activityNoti, setActivityNoti] = useState<Notification[]>([]);
  const [showActivityNoti, setShowActivityNoti] = useState(false);
  const activityNotiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadActivityCount = activityNoti.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/main");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadChatCount(0);
      setActivityNoti([]);
      return;
    }
    const fetch = () => {
      notificationApi
        .getAll()
        .then((list) => {
          setUnreadChatCount(list.filter((n) => n.type === "CHAT_MESSAGE" && !n.isRead).length);
          setActivityNoti(list.filter((n) => n.type !== "CHAT_MESSAGE"));
        })
        .catch(() => {});
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
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleActivityNotiClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationApi.readOne(n.id);
      setActivityNoti((p) => p.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    setShowActivityNoti(false);
    navigate("/circle/my");
  };

  const ACTIVITY_NOTI_ICONS: Record<string, string> = {
    JOIN_REQUEST: "📨",
    JOIN_APPROVED: "✅",
    JOIN_REJECTED: "❌",
    KICKED: "🚫",
    CIRCLE_DISBANDED: "💔",
  };

  const navItems = ["관리자 페이지", "모임 찾기", "커뮤니티", "에너지 테스트", "장소 추천"];
  const visibleNavItems = navItems.filter((item) => item !== "관리자 페이지" || isAdmin);

  const navLinks: Record<string, string> = {
    "모임 찾기": "/circle",
    커뮤니티: "/board",
    "에너지 테스트": isLoggedIn ? "/users/energy-test/result" : "/users/energy-test",
    "장소 추천": "/place/rental",
    "관리자 페이지": "/admin/maindashboard",
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/main"
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: -0.5,
              color: "#111",
              textDecoration: "none",
            }}
          >
            moa
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginLeft: "auto",
              marginRight: 24,
            }}
          >
            <nav style={{ display: "flex", gap: 24 }}>
              {visibleNavItems.map((item) => (
                <div key={item} style={{ position: "relative" }} onMouseEnter={() => setHoveredItem(item)} onMouseLeave={() => setHoveredItem(null)}>
                  <Link
                    to={navLinks[item] ?? "#"}
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: hoveredItem === item ? "#5F8F7B" : "#374151",
                      textDecoration: "none",
                      display: "inline-block",
                      whiteSpace: "nowrap",
                      lineHeight: "60px",
                      transition: "color 0.15s",
                    }}
                  >
                    {item}
                  </Link>
                  {hoveredItem === item && dropdownItems[item]?.length && (
                    <div
                      className="dropdown-menu"
                      style={{
                        position: "absolute",
                        top: 51,
                        left: 0,
                        backgroundColor: "white",
                        border: "1px solid #efefef",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                        padding: "6px",
                        minWidth: 160,
                        zIndex: 100,
                      }}
                    >
                      {dropdownItems[item]?.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            height: 40,
                            padding: "0 12px",
                            borderRadius: 8,
                            fontSize: 13,
                            color: "#444",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <span style={{ color: "#888", display: "flex" }}>{sub.icon}</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isLoggedIn && (
              <div style={{ width: 68 }}>
                <button
                  onClick={() => {
                    const current = window.location.pathname + window.location.search;
                    const noRedirect = ["/users/login", "/users/signup", "/users/onboarding", "/"];
                    if (!noRedirect.some((p) => current.startsWith(p))) {
                      sessionStorage.setItem("postLoginRedirect", current);
                    }
                    navigate("/users/login");
                  }}
                  style={{
                    padding: "5px 0",
                    width: "100%",
                    borderRadius: 6,
                    border: "1px solid #E38B6D",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "#E38B6D",
                  }}
                >
                  로그인
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div ref={activityNotiRef} style={{ position: "relative", marginRight: 16 }}>
                <button
                  onClick={() => setShowActivityNoti((v) => !v)}
                  title="활동 알림"
                  style={{
                    width: 32,
                    height: 32,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <Bell size={20} color="#374151" strokeWidth={1.8} />
                </button>
                {unreadActivityCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    {unreadActivityCount > 99 ? "99+" : unreadActivityCount}
                  </span>
                )}
                {showActivityNoti && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 300,
                      background: "#fff",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      border: "1px solid #E5E7EB",
                      zIndex: 200,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom: "1px solid #F3F4F6",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1F2937",
                        }}
                      >
                        활동 알림
                      </span>
                      <button
                        onClick={async () => {
                          const ids = activityNoti.filter((n) => !n.isRead).map((n) => n.id);
                          if (ids.length === 0) return;
                          await notificationApi.readAll();
                          setActivityNoti((p) => p.map((n) => ({ ...n, isRead: true })));
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: 12,
                          color: "#5F8F7B",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        전체 읽음
                      </button>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {activityNoti.length === 0 ? (
                        <p
                          style={{
                            textAlign: "center",
                            padding: "24px 0",
                            color: "#9CA3AF",
                            fontSize: 13,
                          }}
                        >
                          알림 없음
                        </p>
                      ) : (
                        activityNoti.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleActivityNotiClick(n)}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                              padding: "10px 16px",
                              cursor: "pointer",
                              background: n.isRead ? "#fff" : "#EAF4F0",
                              borderBottom: "1px solid #F3F4F6",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? "#fff" : "#EAF4F0")}
                          >
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{ACTIVITY_NOTI_ICONS[n.type] ?? "🔔"}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  color: "#1F2937",
                                  lineHeight: 1.4,
                                }}
                              >
                                {n.message}
                              </p>
                              <p
                                style={{
                                  margin: "3px 0 0",
                                  fontSize: 11,
                                  color: "#9CA3AF",
                                }}
                              >
                                {new Date(n.createdAt).toLocaleString("ko-KR", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: "#5F8F7B",
                                  flexShrink: 0,
                                  marginTop: 4,
                                }}
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoggedIn && (
              <div style={{ position: "relative", marginRight: 20 }}>
                <button
                  onClick={() => setChatOpen((v) => !v)}
                  title="채팅"
                  style={{
                    width: 32,
                    height: 32,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={20} color="#374151" strokeWidth={1.8} />
                </button>
                {unreadChatCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isLoggedIn ? (
                <div
                  ref={profileRef}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    onClick={() => setProfileOpen((v) => !v)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#6C8197",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      userSelect: "none",
                      overflow: "hidden",
                    }}
                  >
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="프로필" style={{ width: 40, height: 40, objectFit: "cover" }} />
                    ) : (
                      (user?.nickname?.[0]?.toUpperCase() ?? "U")
                    )}
                  </div>
                  <span
                    onClick={() => navigate("/users/profile")}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    style={{
                      fontSize: 15,
                      fontWeight: 400,
                      color: "#374151",
                      maxWidth: 80,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    {user?.nickname}
                  </span>
                  {profileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        backgroundColor: "white",
                        border: "1px solid #efefef",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                        padding: "6px",
                        minWidth: 150,
                        zIndex: 100,
                      }}
                    >
                      {[
                        {
                          label: "마이 프로필",
                          href: "/users/profile",
                          icon: <User size={15} />,
                        },
                        {
                          label: "계정",
                          href: "/users/account",
                          icon: <Settings size={15} />,
                        },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            height: 40,
                            padding: "0 12px",
                            borderRadius: 8,
                            fontSize: 13,
                            color: "#444",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <span style={{ color: "#888", display: "flex" }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      <div
                        style={{
                          height: 1,
                          backgroundColor: "#f0f0f0",
                          margin: "4px 6px",
                        }}
                      />
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          height: 40,
                          padding: "0 12px",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "#e53e3e",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          width: "100%",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <span style={{ color: "#e53e3e", display: "flex" }}>
                          <LogOut size={15} />
                        </span>
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/users/signup")}
                  style={{
                    padding: "5px 0",
                    width: 72,
                    borderRadius: 6,
                    border: "none",
                    background: "#E38B6D",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
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
