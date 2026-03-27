import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export type CommunityProfileQuickView = "home" | "myPosts" | "myReplies" | "scrap";

interface CommunityProfileCardProps {
  selectedView: CommunityProfileQuickView;
  onSelectView: (view: CommunityProfileQuickView) => void;
  writeHref: string;
}

function avatarColor(seed: string) {
  const palette = ["#5F8F7B", "#457B9D", "#E3886D", "#6D6875", "#2A9D8F"];
  const idx = (seed?.charCodeAt(0) ?? 0) % palette.length;
  return palette[idx];
}

export default function CommunityProfileCard({
  selectedView,
  onSelectView,
  writeHref,
}: CommunityProfileCardProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn) {
    return (
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          backgroundColor: "#fff",
          padding: 16,
        }}
      >
        <button
          onClick={() => navigate("/users/login")}
          style={{
            width: "100%",
            height: 42,
            border: "none",
            borderRadius: 10,
            backgroundColor: "#5F8F7B",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          로그인
        </button>
      </section>
    );
  }

  const quickButtonBaseStyle = {
    width: "100%",
    height: 44,
    border: "1px solid #5F8F7B",
    color: "#3D5F52",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 12,
    padding: "0 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box" as const,
  };

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        backgroundColor: "#fff",
        padding: 16,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="프로필"
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              backgroundColor: avatarColor(user?.nickname ?? ""),
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {(user?.nickname?.[0] ?? "U").toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 900,
              color: "#1f2937",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.nickname}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12.7, color: "#5F8F7B", fontWeight: 700 }}>
            레벨 1
          </p>
        </div>
      </div>

      <div>
        <div
          style={{
            width: "100%",
            height: 8,
            borderRadius: 999,
            backgroundColor: "#eef2f5",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "22%",
              height: "100%",
              borderRadius: 999,
              backgroundColor: "#5F8F7B",
            }}
          />
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280", textAlign: "right" }}>
          다음 레벨까지 11 남음
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          type="button"
          onClick={() => onSelectView("myPosts")}
          style={{
            ...quickButtonBaseStyle,
            backgroundColor: selectedView === "myPosts" ? "#EAF4F0" : "#fff",
            cursor: "pointer",
          }}
        >
          내가 쓴 글
        </button>
        <button
          type="button"
          onClick={() => onSelectView("myReplies")}
          style={{
            ...quickButtonBaseStyle,
            backgroundColor: selectedView === "myReplies" ? "#EAF4F0" : "#fff",
            cursor: "pointer",
          }}
        >
          내가 쓴 댓글
        </button>
        <button
          type="button"
          onClick={() => onSelectView("scrap")}
          style={{
            ...quickButtonBaseStyle,
            backgroundColor: selectedView === "scrap" ? "#EAF4F0" : "#fff",
            cursor: "pointer",
          }}
        >
          스크랩
        </button>
        <Link
          to={writeHref}
          style={{
            ...quickButtonBaseStyle,
            border: "none",
            textDecoration: "none",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            backgroundColor: "#5F8F7B",
          }}
        >
          글쓰기
        </Link>
      </div>
    </section>
  );
}
