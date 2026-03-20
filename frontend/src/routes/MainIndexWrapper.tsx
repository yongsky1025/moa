import { useSelector } from "react-redux";
import MainIndex from "../common/MainIndex";
import type { RootState } from "../users/reducers/store";

export default function MainIndexWrapper() {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);

  return <MainIndex isLoggedIn={isLoggedIn} isAdmin={user?.userRole === "ADMIN"} onToggleLogin={() => {}} />;
}
