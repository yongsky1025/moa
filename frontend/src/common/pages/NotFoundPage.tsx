import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import ErrorShell from "../components/ErrorShell";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ErrorShell
      code="404"
      title="페이지를 찾을 수 없습니다"
      message="주소가 잘못되었거나, 이동 또는 삭제된 페이지입니다."
      icon={<SearchX className="h-7 w-7" />}
      actions={[
        { label: "메인으로 이동", onClick: () => navigate("/main"), variant: "primary" },
        { label: "이전 페이지", onClick: () => navigate(-1), variant: "secondary" },
      ]}
    />
  );
}
