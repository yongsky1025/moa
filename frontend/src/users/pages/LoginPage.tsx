import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { useAuthStore } from "../../store/authStore";

const CSS = `
  .login-input:focus {
    border-color: #5F8F7B !important;
    box-shadow: 0 0 0 2px rgba(95,143,123,0.10) !important;
    background: #fff !important;
  }

  .login-input:-webkit-autofill,
  .login-input:-webkit-autofill:hover,
  .login-input:-webkit-autofill:focus,
  .login-input:-webkit-autofill:active {
    -webkit-text-fill-color: #1F2937 !important;
    -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
    box-shadow: 0 0 0 1000px #FFFFFF inset !important;
    border: 1px solid #E5E7EB !important;
    transition: background-color 9999s ease-out 0s;
  }

  .login-btn:hover:not(:disabled) { background: #4E7C69 !important; }
  .login-link:hover { color: #5F8F7B !important; }
  .login-social:hover { opacity: 0.9; }
  .login-signup:hover { text-decoration: underline; }
`;

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
    <div style={s.page}>
      <style>{CSS}</style>

      <div style={s.wrapper}>
        {/* 로고 + 카피 */}
        <div style={s.logoArea}>
          <Link to="/" style={s.logo}>
            moa
          </Link>
          <p style={s.tagline}>내 에너지에 맞는 모임을 시작해보세요</p>
        </div>

        {/* 카드 */}
        <div style={s.card}>
          <div style={s.contentInner}>
            {/* 이메일 로그인 */}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 10 }}>
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (oauthError) setOauthError("");
                    if (error) clearError();
                  }}
                  required
                  className="login-input"
                  style={s.input}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
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
                  className="login-input"
                  style={s.input}
                />
              </div>

              {/* 에러 */}
              {(oauthError || error) && <p style={s.error}>{oauthError || error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{
                  ...s.submitBtn,
                  background: loading ? "#5F8F7B" : "#4E7C69",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            {/* 비밀번호 찾기 */}
            <div style={s.forgotWrap}>
              <Link to="/users/find-password" className="login-link" style={s.forgotLink}>
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 구분선 */}
            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>또는 간편하게 시작하기</span>
              <div style={s.dividerLine} />
            </div>

            {/* 소셜 로그인 */}
            <div style={s.socialGroup}>
              <button
                onClick={() => handleSocialLogin("kakao")}
                className="login-social"
                style={{ ...s.socialBtn, background: "#FEE500", color: "#191919" }}
              >
                <RiKakaoTalkFill style={{ width: 20, height: 20, color: "#191919" }} />
                카카오로 계속하기
              </button>

              <button
                onClick={() => handleSocialLogin("naver")}
                className="login-social"
                style={{ ...s.socialBtn, background: "#03C75A", color: "#fff" }}
              >
                <SiNaver style={{ width: 15, height: 15, color: "#fff" }} />
                네이버로 계속하기
              </button>

              <button
                onClick={() => handleSocialLogin("google")}
                className="login-social"
                style={{ ...s.socialBtn, background: "#fff", color: "#3c4043", border: "1.5px solid #E5E7EB" }}
              >
                <FcGoogle style={{ width: 20, height: 20 }} />
                구글로 계속하기
              </button>
            </div>

            {/* 회원가입 */}
            <p style={s.signupRow}>
              아직 회원이 아니신가요?{" "}
              <Link to="/users/signup" className="login-signup" style={s.signupLink}>
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F8FAF9",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "16px 16px 24px",
  },
  wrapper: {
    width: "100%",
    maxWidth: 440,
  },

  /* 로고 */
  logoArea: {
    textAlign: "center",
    marginBottom: 22,
  },
  logo: {
    fontSize: 30,
    fontWeight: 900,
    color: "#1F2937",
    textDecoration: "none",
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 1.4,
  },

  /* 카드 */
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 20,
    padding: "26px 24px",
    boxShadow: "0 8px 24px rgba(31, 45, 61, 0.06)",
  },
  cardTitle: {
    margin: "0 0 18px",
    fontSize: 22,
    fontWeight: 700,
    color: "#5F8F7B",
    paddingLeft: 9,
  },
  contentInner: {
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
  },

  /* 입력 */
  input: {
    width: "100%",
    height: 50,
    padding: "0 14px",
    border: "1px solid #D7E0DB",
    borderRadius: 14,
    fontSize: 15,
    color: "#1F2937",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  /* 에러 */
  error: {
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 14,
    textAlign: "center",
  },

  /* 로그인 버튼 */
  submitBtn: {
    width: "100%",
    height: 56,
    color: "#fff",
    border: "none",
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    transition: "background 0.15s",
  },

  /* 비밀번호 찾기 */
  forgotWrap: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 4,
  },
  forgotLink: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecoration: "none",
    transition: "color 0.15s",
  },

  /* 구분선 */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "18px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#E3EbE7",
  },
  dividerText: {
    fontSize: 12,
    color: "#A9C8BB",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  /* 소셜 */
  socialGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  socialBtn: {
    width: "100%",
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    border: "none",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },

  /* 회원가입 */
  signupRow: {
    marginTop: 18,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  signupLink: {
    color: "#5F8F7B",
    fontWeight: 700,
    textDecoration: "none",
  },
};
