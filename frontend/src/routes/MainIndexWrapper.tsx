import MainIndex from "../common/MainIndex";
import { useAuthStore } from "../store/authStore";

export default function MainIndexWrapper() {
  const { isLoggedIn, user } = useAuthStore();

  return <MainIndex isLoggedIn={isLoggedIn} isAdmin={user?.userRole === "ADMIN"} onToggleLogin={() => {}} />;
}
