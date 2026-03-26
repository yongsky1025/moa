import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, login, clearError } = useAuthStore();
  const [oauthError, setOauthError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const oauthErrorMessages: Record<string, string> = {
    authorization_request_not_found: "소셜 로그인 세션이 만료됐습니다. 다시 시도해주세요.",
    auth_failed: "소셜 로그인에 실패했습니다. 다시 시도해주세요.",
  };

  useEffect(() => {
    const raw = searchParams.get("error") ?? "";
    setOauthError(oauthErrorMessages[raw] ?? raw);
  }, [searchParams]);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const user = await login({ email, password });
    if (user) {
      if (!user.onboardingCompleted) {
        sessionStorage.removeItem("postLoginRedirect");
        navigate("/users/onboarding");
      } else {
        const redirect = sessionStorage.getItem("postLoginRedirect") ?? "/main";
        sessionStorage.removeItem("postLoginRedirect");
        navigate(redirect);
      }
    }
  };

  const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
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
      <div
        style={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
          {/* 소셜 로그인 섹션 */}
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#555",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              소셜 계정으로 로그인
            </p>

            {/* 구글 */}
            <button
              onClick={() => handleSocialLogin("google")}
              style={{
                width: "100%",
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "white",
                border: "1.5px solid #e0e0e0",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "#3c4043",
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              <FcGoogle style={{ width: 20, height: 20 }} />
              구글로 로그인
            </button>

            {/* 카카오 */}
            <button
              onClick={() => handleSocialLogin("kakao")}
              style={{
                width: "100%",
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "#FEE500",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "#191919",
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              <RiKakaoTalkFill style={{ width: 20, height: 20, color: "#191919" }} />
              카카오로 로그인
            </button>

            {/* 네이버 */}
            <button
              onClick={() => handleSocialLogin("naver")}
              style={{
                width: "100%",
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "#03C75A",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
              }}
            >
              <SiNaver style={{ width: 16, height: 16, color: "white" }} />
              네이버로 로그인
            </button>
          </div>

          {/* 구분선 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
            <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>또는</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
          </div>

          {/* 이메일 로그인 섹션 */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 10 }}>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (oauthError) setOauthError("");
                  if (error) clearError();
                }}
                required
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 14px",
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 12,
                  fontSize: 14,
                  color: "#111",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fafafa",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (oauthError) setOauthError("");
                  if (error) clearError();
                }}
                required
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 14px",
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 12,
                  fontSize: 14,
                  color: "#111",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fafafa",
                }}
              />
            </div>

            {/* 에러 메시지 */}
            {(oauthError || error) && (
              <p
                style={{
                  fontSize: 13,
                  color: "#ff4d4f",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {oauthError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 48,
                backgroundColor: loading ? "#555" : "#111",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 하단 링크 */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Link
              to="/users/find-password"
              style={{
                fontSize: 13,
                color: "#888",
                textDecoration: "none",
              }}
            >
              비밀번호를 잊으셨나요?
            </Link>

            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              아직 회원이 아니신가요?{" "}
              <Link
                to="/users/signup"
                style={{
                  color: "#111",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
