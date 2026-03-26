import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const STATUS_INFO: Record<string, { title: string; message: string; icon: string }> = {
  ACCOUNT_WITHDRAWN: {
    title: "탈퇴한 계정",
    message: "이 계정은 탈퇴 처리되었습니다.\n다시 이용하시려면 재가입을 진행해주세요.",
    icon: "👋",
  },
  ACCOUNT_SUSPENDED: {
    title: "활동 제한 계정",
    message: "이 계정은 일시적으로 활동이 제한되었습니다.\n자세한 사항은 고객센터에 문의해주세요.",
    icon: "⏸️",
  },
  ACCOUNT_BANNED: {
    title: "영구 정지 계정",
    message: "이 계정은 이용약관 위반으로 영구 정지되었습니다.\n자세한 사항은 고객센터에 문의해주세요.",
    icon: "🚫",
  },
};

const DEFAULT_INFO = {
  title: "이용 불가",
  message: "현재 이 계정으로는 서비스를 이용할 수 없습니다.",
  icon: "⚠️",
};

export default function AccountStatusPage() {
  const [params] = useSearchParams();
  const logout = useAuthStore((s) => s.logout);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const code = params.get("code") ?? "";
  const info = STATUS_INFO[code] ?? DEFAULT_INFO;

  const handleGoLogin = () => {
    clearAuth();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link
            to="/"
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#111",
              textDecoration: "none",
              letterSpacing: -1,
            }}
          >
            moa
          </Link>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: "40px 28px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>{info.icon}</div>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#111",
              margin: "0 0 12px",
            }}
          >
            {info.title}
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
              margin: "0 0 28px",
            }}
          >
            {info.message}
          </p>

          <Link
            to="/users/login"
            onClick={handleGoLogin}
            style={{
              display: "block",
              width: "100%",
              height: 48,
              lineHeight: "48px",
              backgroundColor: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
