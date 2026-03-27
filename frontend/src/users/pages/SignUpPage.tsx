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
        background: "#F8FAF9",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px 16px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link
            to="/main"
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#1F2937",
              textDecoration: "none",
              letterSpacing: -1,
            }}
          >
            moa
          </Link>
          <p style={{ marginTop: 10, fontSize: 14, color: "#1F2937" }}>내 에너지에 맞는 모임을 시작해보세요</p>
        </div>

        {/* 카드 */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #DDE5E1",
            borderRadius: 20,
            padding: "26px 24px",
            boxShadow: "0 8px 24px rgba(31, 45, 61, 0.06)",
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
            소셜 계정으로 계속하기
          </p>

          {/* 카카오 */}
          <button onClick={() => handleSocial("kakao")} style={socialBtnStyle("#FEE500", "#191919", "none")}>
            <RiKakaoTalkFill style={{ width: 20, height: 20, color: "#191919" }} />
            카카오로 계속하기
          </button>

          {/* 네이버 */}
          <button onClick={() => handleSocial("naver")} style={socialBtnStyle("#03C75A", "#fff", "none")}>
            <SiNaver style={{ width: 16, height: 16, color: "white" }} />
            네이버로 계속하기
          </button>

          {/* 구글 */}
          <button onClick={() => handleSocial("google")} style={{ ...socialBtnStyle("#fff", "#3c4043", "1.5px solid #e0e0e0"), marginBottom: 0 }}>
            <FcGoogle style={{ width: 20, height: 20 }} />
            구글로 계속하기
          </button>

          {/* 구분선 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e3ebe7" }} />
            <span style={{ fontSize: 12, color: "#A9C8BB", fontWeight: 500 }}>또는</span>
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
              height: 50,
              backgroundColor: "#4E7C69",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            이메일로 회원가입
          </Link>

          {/* 하단 링크 */}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              이미 계정이 있으신가요?{" "}
              <Link to="/users/login" style={{ color: "#5F8F7B", fontWeight: 700, textDecoration: "none" }}>
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
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    color,
    cursor: "pointer",
    marginBottom: 10,
    boxSizing: "border-box",
  };
}
