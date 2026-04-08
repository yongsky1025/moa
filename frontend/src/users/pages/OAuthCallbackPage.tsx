import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const isNew = searchParams.get("isNew") === "true";
    const error = searchParams.get("error");

    if (error) {
      navigate("/users/login?error=" + encodeURIComponent(error));
      return;
    }

    if (!token) {
      navigate("/users/login");
      return;
    }

    localStorage.setItem("accessToken", token);

    if (isNew) {
      navigate("/users/social-signup");
      return;
    }

    // 기존 유저 → accessToken만으로 유저 정보 조회 (refresh 쿠키 불필요)
    authApi
      .getMe()
      .then((res) => {
        setAuth(token, res.data);

        if (!res.data.onboardingCompleted) {
          sessionStorage.removeItem("postLoginRedirect");
          navigate("/users/onboarding");
        } else {
          const redirect =
            sessionStorage.getItem("postLoginRedirect") ?? "/main";
          sessionStorage.removeItem("postLoginRedirect");
          navigate(redirect);
        }
      })
      .catch((e) => {
        console.error("[OAuthCallback] 유저 정보 조회 실패:", e);
        navigate(
          "/users/login?error=" +
            encodeURIComponent(
              "로그인 상태를 확인할 수 없습니다. 다시 로그인해주세요.",
            ),
        );
      });
  }, [searchParams, navigate, setAuth]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7f7f8",
      }}
    >
      <p style={{ fontSize: 15, color: "#888" }}>로그인 처리 중...</p>
    </div>
  );
}
