import MainIndex from "../common/MainIndex";
import { useAuthStore } from "../store/authStore";

export default function MainIndexWrapper() {
  const { isLoggedIn } = useAuthStore();

  return (
    <MainIndex
      isLoggedIn={isLoggedIn}
      onToggleLogin={() => {}}
    />
  );
}
