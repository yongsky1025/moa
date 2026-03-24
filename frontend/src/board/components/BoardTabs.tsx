import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { postRoutes } from "../../post/routes/postRoutes";

export default function BoardTabs() {
  const location = useLocation();
  const pathname = location.pathname;

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: active ? "white" : "#333",
    backgroundColor: active ? "#111" : "#f2f2f2",
    fontSize: 14,
    fontWeight: 600,
  });

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <Link to={postRoutes.freeBase} style={tabStyle(pathname.includes("/free"))}>
        자유
      </Link>
      <Link to={postRoutes.noticeBase} style={tabStyle(pathname.includes("/notice"))}>
        공지
      </Link>
    </div>
  );
}
