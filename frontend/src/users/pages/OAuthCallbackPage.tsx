import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthFromOAuth } from "../reducers/authSlice";
import { authApi } from "../../api/authApi";
import type { AppDispatch } from "../reducers/store";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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
      navigate("/users/social-signup"); // 소셜 회원가입 -> 추가정보 페이지로 이동
      return;
    }

    // 기존 유저 → refresh로 유저 정보 조회 후 상태 반영
    authApi
      .refresh()
      .then((res) => {
        localStorage.setItem("accessToken", res.data.accessToken);
        dispatch(setAuthFromOAuth(res.data.user));

        if (!res.data.user?.onboardingCompleted) {
          navigate("/users/onboarding"); // 온보딩
        } else {
          navigate("/users/energy-test/result"); // 완료 시
        }
      })
      .catch((e) => {
        console.error("[OAuthCallback] refresh 실패:", e);
        navigate("/users/login?error=" + encodeURIComponent("로그인 상태를 확인할 수 없습니다. 다시 로그인해주세요."));
      });
  }, [searchParams, navigate, dispatch]);

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
