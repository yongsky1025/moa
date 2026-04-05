import MainIndex from "../common/MainIndex";
import { useAuthStore } from "../store/authStore";

export default function MainIndexWrapper() {
  const { isLoggedIn, user, authReady } = useAuthStore();

  return (
    <MainIndex
      isLoggedIn={isLoggedIn}
      isOnboardingCompleted={!!user?.onboardingCompleted}
      authReady={authReady}
      isAdmin={user?.userRole === "ADMIN"}
      onToggleLogin={() => {}}
    />
  );
}
