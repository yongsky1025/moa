import React, { useState, useEffect, useRef } from "react";
import { Bell, MessageCircle, LayoutGrid, Users, User, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { notificationApi } from "../../api/notificationApi";
import type { Notification } from "../../types/notification";
import FloatingChatWindow from "../../chat/components/FloatingChatWindow";
import { toAssetUrl } from "../utils/assetUrl";
import { useAlarmSocket } from "../../chat/hooks/useAlarmSocket";
import DropdownMenu, { type DropdownMenuItem } from "../components/DropdownMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout, userId: alarmUserId } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activityNoti, setActivityNoti] = useState<Notification[]>([]);
  const [showActivityNoti, setShowActivityNoti] = useState(false);
  const activityNotiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadActivityCount = activityNoti.filter((n) => !n.isRead).length;

  useAlarmSocket(isLoggedIn ? alarmUserId : null, (noti) => {
    if (noti.type === "CHAT_MESSAGE") {
      setUnreadChatCount((c) => c + 1);
    } else {
      setActivityNoti((prev) => [noti, ...prev]);
    }
  });

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

  const dropdownItems: Record<string, DropdownMenuItem[]> = {
    모임: [
      {
        key: "circle-all",
        label: "전체 모임",
        href: "/circle",
        icon: <LayoutGrid size={15} />,
        onClick: () => {
          setHoveredItem(null);
          setOpenDropdown(null);
        },
      },
      {
        key: "circle-my",
        label: "내 모임",
        href: "/circle/my",
        icon: <Users size={15} />,
        onClick: () => {
          setHoveredItem(null);
          setOpenDropdown(null);
        },
      },
    ],
  };

  const profileDropdownItems: DropdownMenuItem[] = [
    {
      key: "profile",
      label: "마이 프로필",
      href: "/users/profile",
      icon: <User size={15} />,
      onClick: () => setProfileOpen(false),
    },
    {
      key: "account",
      label: "계정",
      href: "/users/account",
      icon: <Settings size={15} />,
      onClick: () => setProfileOpen(false),
    },
    { type: "divider", key: "profile-divider" },
    {
      type: "button",
      key: "logout",
      label: "로그아웃",
      icon: <LogOut size={15} />,
      tone: "danger",
      onClick: handleLogout,
    },
  ];

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
    const id = n.referenceId;
    switch (n.type) {
      case "JOIN_REQUEST":
        navigate(id ? `/circle/${id}/manage?tab=members` : "/circle/my");
        break;
      case "JOIN_APPROVED":
        navigate(id ? `/circle/${id}` : "/circle/my");
        break;
      case "JOIN_REJECTED":
      case "KICKED":
      case "CIRCLE_DISBANDED":
        navigate(id ? `/circle/${id}` : "/circle/my");
        break;
      case "REPLY":
      case "CHILD_REPLY":
      case "POST_LIKE":
      case "REPLY_LIKE":
        navigate(id ? `/board/free/${id}` : "/board");
        break;
      default:
        navigate("/circle/my");
    }
  };

  const ACTIVITY_NOTI_ICONS: Record<string, string> = {
    JOIN_REQUEST: "📨",
    JOIN_APPROVED: "✅",
    JOIN_REJECTED: "❌",
    KICKED: "🚫",
    CIRCLE_DISBANDED: "💔",
    REPLY: "💬",
    CHILD_REPLY: "↩️",
    POST_LIKE: "👍",
    REPLY_LIKE: "👍",
  };

  const energyPath = isLoggedIn ? "/users/energy-test/result" : "/users/energy-test";

  const navItems = [
    { label: "에너지 테스트", href: energyPath },
    { label: "모임", href: "/circle" },
    { label: "플레이스", href: "/place/rental" },
    { label: "커뮤니티", href: "/board" },
    ...(isAdmin ? [{ label: "관리자", href: "/admin/maindashboard" }] : []),
  ];

  const isNavActive = (label: string, href: string) => {
    if (label === "에너지 테스트") return location.pathname.startsWith("/users/energy-test");
    if (label === "모임") return location.pathname.startsWith("/circle");
    if (label === "플레이스") return location.pathname.startsWith("/place");
    if (label === "커뮤니티") return location.pathname.startsWith("/board");
    if (label === "관리자") return location.pathname.startsWith("/admin");
    return location.pathname === href;
  };

  const utilityButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    background: "#F8FAF9",
    border: "1px solid #E6EEEA",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #edf0ee",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/main"
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: -0.5,
              color: "#111",
              textDecoration: "none",
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/main");
            }}
          >
            moa
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginLeft: "auto",
              marginRight: 18,
            }}
          >
            <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {navItems.map((item) => {
                const isActive = isNavActive(item.label, item.href);
                const isHovered = hoveredItem === item.label;

                return (
                  <div
                    key={item.label}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      to={item.href}
                      onClick={(e) => {
                        if (location.pathname === item.href) {
                          e.preventDefault();
                          navigate(0);
                        }
                      }}
                      style={{
                        fontSize: 15,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#5F8F7B" : isHovered ? "#1F2937" : "#666",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 68,
                        padding: "0 14px",
                        borderBottom: isActive ? "2.5px solid #5F8F7B" : "2.5px solid transparent",
                        background: "transparent",
                        whiteSpace: "nowrap",
                        transition: "color 0.15s, border-color 0.15s",
                        boxSizing: "border-box",
                      }}
                    >
                      {item.label}
                    </Link>
                    {(isHovered || openDropdown === item.label) && dropdownItems[item.label]?.length && (
                      <DropdownMenu items={dropdownItems[item.label]} top="90%" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 1,
                height: 20,
                background: "#E0E0E0",
                margin: "0 6px",
                flexShrink: 0,
              }}
            />
            {!isLoggedIn && (
              <div style={{ width: 78 }}>
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
                    height: 34,
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid #5F8F7B",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#5F8F7B",
                  }}
                >
                  로그인
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div ref={activityNotiRef} style={{ position: "relative", marginRight: 16 }}>
                <button
                  onClick={() => {
                    if (!showActivityNoti) {
                      setShowActivityNoti(true);
                      if (unreadActivityCount > 0) notificationApi.readAll().catch(() => {});
                    } else {
                      setShowActivityNoti(false);
                      setActivityNoti((p) => p.map((n) => ({ ...n, isRead: true })));
                    }
                  }}
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
                {!showActivityNoti && unreadActivityCount > 0 && (
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
                              borderLeft: n.isRead ? "3px solid transparent" : "3px solid #5F8F7B",
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
                                  fontWeight: n.isRead ? 400 : 600,
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
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    const next = !chatOpen;
                    setChatOpen(next);
                    if (next) setUnreadChatCount(0);
                  }}
                  title="채팅"
                  style={utilityButtonStyle}
                >
                  <MessageCircle size={20} color="#999" strokeWidth={1.8} />
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
                gap: 8,
              }}
            >
              {isLoggedIn ? (
                <div
                  ref={profileRef}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    background: "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end", // 오른쪽 정렬, 왼쪽은 투명 여백으로
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minHeight: 40,
                        minWidth: 140,
                        maxWidth: 140,
                        padding: "4px 10px 4px 4px",
                        borderRadius: 999,
                        border: "1px solid #E6EEEA",
                        backgroundColor: "#F8FAF9",
                        cursor: "pointer",
                        color: "#374151",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: "#5F8F7B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fff",
                          userSelect: "none",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {user?.profileImageUrl ? (
                          <img
                            src={toAssetUrl(user.profileImageUrl)}
                            alt="프로필"
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          (user?.nickname?.[0]?.toUpperCase() ?? "U")
                        )}
                      </div>
                      <span
                        style={{
                          display: "block",
                          minWidth: 0,
                          maxWidth: 80,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#4B5563",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {user?.nickname}
                      </span>
                    </button>
                  </div>
                  {profileOpen && <DropdownMenu items={profileDropdownItems} align="right" minWidth={150} />}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/users/signup")}
                  style={{
                    height: 34,
                    width: 80,
                    borderRadius: 12,
                    border: "none",
                    background: "#5F8F7B",
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
