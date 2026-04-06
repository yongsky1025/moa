import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import UserAvatar from "../../common/components/UserAvatar";

export type CommunityProfileQuickView = "home" | "myPosts" | "myReplies" | "scrap";

interface CommunityProfileCardProps {
  selectedView: CommunityProfileQuickView;
  onSelectView: (view: CommunityProfileQuickView) => void;
  writeHref: string;
  writeLabel?: string;
  onWriteClick?: () => void;
  bottomAction?: ReactNode;
  replaceWithPending?: boolean;
  pendingContent?: ReactNode;
}

export default function CommunityProfileCard({
  selectedView,
  onSelectView,
  writeHref,
  writeLabel = "글쓰기",
  onWriteClick,
  bottomAction,
  replaceWithPending = false,
  pendingContent,
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
      {replaceWithPending && pendingContent ? (
        pendingContent
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <UserAvatar
              name={user?.nickname}
              imageUrl={user?.profileImageUrl}
              size={46}
              initialMode="nickname"
            />
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
            </div>
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
              내가 찜한 글
            </button>
            {onWriteClick ? (
              <button
                type="button"
                onClick={onWriteClick}
                style={{
                  ...quickButtonBaseStyle,
                  backgroundColor: selectedView === "home" ? "#EAF4F0" : "#fff",
                  cursor: "pointer",
                }}
              >
                {writeLabel}
              </button>
            ) : (
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
                {writeLabel}
              </Link>
            )}
          </div>
        </>
      )}
      {bottomAction}
    </section>
  );
}
