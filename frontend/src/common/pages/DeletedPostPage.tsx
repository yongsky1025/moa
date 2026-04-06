import { useNavigate } from "react-router-dom";
import { FileX2 } from "lucide-react";
import ErrorShell from "../components/ErrorShell";

export default function DeletedPostPage() {
  const navigate = useNavigate();

  return (
    <ErrorShell
      code="POST_DELETED"
      title="삭제된 게시글입니다"
      message="요청하신 게시글은 삭제되었거나 더 이상 열람할 수 없습니다."
      icon={<FileX2 className="h-7 w-7" />}
      actions={[
        { label: "게시판으로 이동", onClick: () => navigate("/board"), variant: "primary" },
        { label: "메인으로 이동", onClick: () => navigate("/main"), variant: "secondary" },
      ]}
    />
  );
}
