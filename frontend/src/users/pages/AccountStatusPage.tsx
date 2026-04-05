import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const STATUS_INFO: Record<string, { title: string; message: string; icon: "x" | "pause" | "ban" | "warn" }> = {
  ACCOUNT_WITHDRAWN: {
    title: "탈퇴한 계정",
    message: "이 계정은 탈퇴 처리되었습니다.\n다시 이용하시려면 재가입을 진행해주세요.",
    icon: "x",
  },
  ACCOUNT_SUSPENDED: {
    title: "활동 제한 계정",
    message: "이 계정은 일시적으로 활동이 제한되었습니다.\n자세한 사항은 고객센터에 문의해주세요.",
    icon: "pause",
  },
  ACCOUNT_BANNED: {
    title: "영구 정지 계정",
    message: "이 계정은 이용약관 위반으로 영구 정지되었습니다.\n자세한 사항은 고객센터에 문의해주세요.",
    icon: "ban",
  },
};

const DEFAULT_INFO = {
  title: "이용 불가",
  message: "현재 이 계정으로는 서비스를 이용할 수 없습니다.",
  icon: "warn" as const,
};

function StatusIcon({ type }: { type: "x" | "pause" | "ban" | "warn" }) {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {type === "x" && (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        )}
        {type === "pause" && (
          <>
            <rect x="6" y="4" width="4" height="16" rx="1" fill="#999" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="#999" />
          </>
        )}
        {type === "ban" && (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </>
        )}
        {type === "warn" && (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </>
        )}
      </svg>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: 48,
  lineHeight: "48px",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
  textAlign: "center",
  boxSizing: "border-box",
  cursor: "pointer",
};

export default function AccountStatusPage() {
  const [params] = useSearchParams();
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
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: "48px 28px 36px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            textAlign: "center",
          }}
        >
          <StatusIcon type={info.icon} />

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
              color: "#888",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              margin: "0 0 32px",
            }}
          >
            {info.message}
          </p>

          <Link
            to="/users/login"
            onClick={handleGoLogin}
            style={{
              ...btnBase,
              backgroundColor: "#5F8F7B",
              color: "#fff",
              border: "1.5px solid #5F8F7B",
            }}
          >
            로그인 페이지로 돌아가기
          </Link>
          {(code === "ACCOUNT_BANNED" || code === "ACCOUNT_SUSPENDED") && (
            <button
              disabled
              style={{
                ...btnBase,
                marginTop: 12,
                backgroundColor: "#fff",
                color: "#bbb",
                border: "1.5px solid #e0e0e0",
                cursor: "not-allowed",
              }}
            >
              고객센터 문의 (준비 중)
            </button>
          )}

          {code === "ACCOUNT_WITHDRAWN" && (
            <button
              disabled
              style={{
                ...btnBase,
                marginTop: 12,
                backgroundColor: "#fff",
                color: "#bbb",
                border: "1.5px solid #e0e0e0",
                cursor: "not-allowed",
              }}
            >
              계정 재활성화 안내 (준비 중)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
