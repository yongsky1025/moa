import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import ErrorShell from "../components/ErrorShell";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <ErrorShell
      code="401"
      title="로그인이 필요합니다"
      message="이 페이지를 이용하려면 먼저 로그인해주세요."
      icon={<LogIn className="h-7 w-7" />}
      actions={[
        { label: "로그인으로 이동", onClick: () => navigate("/users/login"), variant: "primary" },
        { label: "메인으로 이동", onClick: () => navigate("/main"), variant: "secondary" },
      ]}
    />
  );
}
