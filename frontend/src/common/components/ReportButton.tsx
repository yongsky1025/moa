import { ShieldAlert } from "lucide-react";
import type { ReportTargetType } from "../../admin/types/adminTypes";
import { openReportForm } from "../utils/openReportForm";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: number;
  /** 버튼 텍스트. 기본값: "신고" */
  label?: string;
  /** 기본 스타일을 완전히 교체하고 싶을 때 사용 */
  className?: string;
}

/**
 * 신고 버튼 공용 컴포넌트
 *
 * @example
 * // 기본 스타일
 * <ReportButton targetType="POST" targetId={post.postId} />
 *
 * // 스타일 교체
 * <ReportButton
 *   targetType="REPLY"
 *   targetId={reply.replyId}
 *   className="text-xs text-gray-400 hover:text-red-500"
 * />
 */
export default function ReportButton({
  targetType,
  targetId,
  label = "신고",
  className,
}: ReportButtonProps) {
  const defaultClass =
    "inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-[#fdf1ec] px-3 py-1.5 text-xs font-medium text-[#E3886D] transition hover:bg-[#E3886D] hover:text-white";

  return (
    <button
      type="button"
      onClick={() => openReportForm(targetType, targetId)}
      className={className ?? defaultClass}
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
