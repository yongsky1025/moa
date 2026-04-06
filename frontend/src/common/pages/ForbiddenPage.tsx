import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import ErrorShell from "../components/ErrorShell";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <ErrorShell
      code="403"
      title="접근 권한이 없습니다"
      message="현재 계정으로는 이 페이지에 접근할 수 없습니다."
      icon={<ShieldAlert className="h-7 w-7" />}
      actions={[
        { label: "이전 페이지", onClick: () => navigate(-1), variant: "primary" },
        { label: "메인으로 이동", onClick: () => navigate("/main"), variant: "secondary" },
      ]}
    />
  );
}
