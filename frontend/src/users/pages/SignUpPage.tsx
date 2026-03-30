import { Link } from "react-router-dom";
import AuthPageLayout from "../components/AuthPageLayout";
import AuthCard from "../components/AuthCard";
import SocialLoginButtons from "../components/SocialLoginButtons";

export default function SignUpPage() {
  const handleSocial = (provider: "google" | "kakao" | "naver") => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  return (
    <AuthPageLayout tagline="내 에너지에 맞는 모임을 시작해보세요" logoHref="/main">
      <AuthCard>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 12, textAlign: "center" }}>
          소셜 계정으로 계속하기
        </p>

        <SocialLoginButtons onLogin={handleSocial} showDivider={false} />

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
      </AuthCard>
    </AuthPageLayout>
  );
}
