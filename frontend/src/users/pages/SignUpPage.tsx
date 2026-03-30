import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

export default function SignUpPage() {
  const handleSocial = (provider: "google" | "kakao" | "naver") => {
    window.location.href = `/oauth2/authorization/${provider}`;
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
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link
            to="/main"
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
          <p style={{ marginTop: 6, fontSize: 14, color: "#888" }}>함께하는 모임, 더 즐거운 일상</p>
        </div>

        {/* 카드 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: "32px 28px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#555",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            소셜 계정으로 시작하기
          </p>

          {/* 구글 */}
          <button onClick={() => handleSocial("google")} style={socialBtnStyle("#fff", "#3c4043", "1.5px solid #e0e0e0")}>
            <FcGoogle style={{ width: 20, height: 20 }} />
            구글로 시작하기
          </button>

          {/* 카카오 */}
          <button onClick={() => handleSocial("kakao")} style={socialBtnStyle("#FEE500", "#191919", "none")}>
            <RiKakaoTalkFill style={{ width: 20, height: 20, color: "#191919" }} />
            카카오로 시작하기
          </button>

          {/* 네이버 */}
          <button onClick={() => handleSocial("naver")} style={{ ...socialBtnStyle("#03C75A", "#fff", "none"), marginBottom: 0 }}>
            <SiNaver style={{ width: 16, height: 16, color: "white" }} />
            네이버로 시작하기
          </button>

          {/* 구분선 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
            <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>또는</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
          </div>

          {/* 이메일 회원가입 버튼 */}
          <Link
            to="/users/email-signup"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 48,
              backgroundColor: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            이메일로 회원가입
          </Link>

          {/* 하단 링크 */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              이미 계정이 있으신가요?{" "}
              <Link to="/users/login" style={{ color: "#111", fontWeight: 700, textDecoration: "none" }}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function socialBtnStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    width: "100%",
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: bg,
    border,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color,
    cursor: "pointer",
    marginBottom: 10,
  };
}
