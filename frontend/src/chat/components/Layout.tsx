import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/authApi";
import NotificationBell from "./NotificationBell";

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo} onClick={() => navigate("/chat")}>
          MOA 채팅
        </span>
        <div style={styles.right}>
          <NotificationBell />
          <span style={styles.nick} onClick={() => navigate("/profile")}>
            {user?.nickname ?? ""}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            로그아웃
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: 56,
    background: "#1976d2",
    color: "#fff",
    flexShrink: 0,
  },
  logo: { fontWeight: "bold", fontSize: 20, cursor: "pointer" },
  right: { display: "flex", alignItems: "center", gap: 16 },
  nick: { fontSize: 14, cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.5)" },
  chatBtn: { background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: "0 4px" },
  logoutBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  main: { flex: 1, overflow: "hidden" },
};
