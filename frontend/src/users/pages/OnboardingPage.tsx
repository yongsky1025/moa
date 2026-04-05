import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { energyProfileApi } from "../../api/usersApi";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { clearGuestEnergyImportIntent, hasGuestEnergyImportIntent } from "../../common/utils/transientNavigationState";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted) return;
    setAttempted(true);

    const guestToken = localStorage.getItem("guestEnergyToken");
    const hasIntent = hasGuestEnergyImportIntent();

    if (!guestToken || !hasIntent) {
      navigate("/users/energy-test?mode=onboarding", { replace: true });
      return;
    }

    // guest token + intent flag 둘 다 있으면 import 시도
    energyProfileApi
      .importFromGuest(guestToken)
      .then(async () => {
        // import 성공 → 토큰/플래그 정리
        localStorage.removeItem("guestEnergyToken");
        clearGuestEnergyImportIntent();

        // auth 상태 갱신 (onboardingCompleted 반영)
        try {
          const refreshed = await authApi.refresh();
          setAuth(refreshed.data.accessToken, refreshed.data.user);
        } catch {
          // refresh 실패해도 import 자체는 성공했으므로 결과 페이지로
        }

        navigate("/users/energy-test/result", { replace: true });
      })
      .catch(() => {
        // import 실패 (토큰 만료 등) → 플래그 정리 후 에너지 테스트로
        localStorage.removeItem("guestEnergyToken");
        clearGuestEnergyImportIntent();
        navigate("/users/energy-test?mode=onboarding", { replace: true });
      });
  }, [attempted, navigate, setAuth]);

  return null;
}
