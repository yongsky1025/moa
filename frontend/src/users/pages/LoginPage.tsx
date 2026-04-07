import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import AuthPageLayout from "../components/AuthPageLayout";
import AuthCard from "../components/AuthCard";
import SocialLoginButtons from "../components/SocialLoginButtons";
import PrimaryButton from "../components/PrimaryButton";
import ModalOverlay from "../components/ModalOverlay";
import { toBackendUrl } from "../../common/utils/backendUrl";

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

  .login-link:hover { color: #5F8F7B !important; }
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
    window.location.href = toBackendUrl(`/oauth2/authorization/${provider}`);
  };

  return (
    <AuthPageLayout tagline="내 에너지에 맞는 모임을 시작해보세요">
      <style>{CSS}</style>

      <AuthCard>
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

            <PrimaryButton type="submit" loading={loading} loadingText="로그인 중..." style={{ height: 56, borderRadius: 16 }}>
              로그인
            </PrimaryButton>
          </form>

          {/* 비밀번호 찾기 */}
          <div style={s.forgotWrap}>
            <Link to="/users/find-password" className="login-link" style={s.forgotLink}>
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 소셜 로그인 */}
          <SocialLoginButtons onLogin={handleSocialLogin} />

          {/* 회원가입 */}
          <p style={s.signupRow}>
            아직 회원이 아니신가요?{" "}
            <Link to="/users/signup" className="login-signup" style={s.signupLink}>
              회원가입
            </Link>
          </p>
        </div>
      </AuthCard>

      {(oauthError || error) && (
        <ModalOverlay onClose={() => { clearError(); setOauthError(""); }} maxWidth={360}>
          <p style={{ fontSize: 15, color: "#1F2937", textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
            {oauthError || error}
          </p>
          <PrimaryButton
            onClick={() => { clearError(); setOauthError(""); }}
            style={{ height: 44, borderRadius: 12 }}
          >
            확인
          </PrimaryButton>
        </ModalOverlay>
      )}
    </AuthPageLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
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
