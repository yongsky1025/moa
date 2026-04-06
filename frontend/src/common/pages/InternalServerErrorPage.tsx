import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import ErrorShell from "../components/ErrorShell";

type InternalServerErrorPageProps = {
  detail?: string;
};

export default function InternalServerErrorPage({ detail }: InternalServerErrorPageProps) {
  const navigate = useNavigate();
  const showDetail = useMemo(() => import.meta.env.DEV && Boolean(detail), [detail]);

  return (
    <ErrorShell
      code="500"
      title="일시적인 오류가 발생했습니다"
      message="불편을 드려 죄송합니다. 잠시 후 다시 시도해주세요."
      icon={<TriangleAlert className="h-7 w-7" />}
      detail={showDetail ? detail : undefined}
      actions={[
        { label: "다시 시도", onClick: () => window.location.reload(), variant: "primary" },
        { label: "메인으로 이동", onClick: () => navigate("/main"), variant: "secondary" },
      ]}
    />
  );
}
