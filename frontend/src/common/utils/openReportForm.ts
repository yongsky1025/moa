import type { ReportTargetType } from "../../admin/types/adminTypes";

/**
 * 신고 팝업 창을 엽니다.
 *
 * @param targetType  신고 대상 종류: "POST" | "REPLY" | "USER" | "CIRCLE"
 * @param targetId    신고 대상의 ID (숫자)
 *
 * @example
 * openReportForm("POST", post.postId);
 * openReportForm("REPLY", reply.replyId);
 * openReportForm("USER", targetUser.userId);
 */
export function openReportForm(targetType: ReportTargetType, targetId: number) {
  const url = `/report-form?targetType=${targetType}&targetId=${targetId}`;
  window.open(url, "report-form", "width=480,height=680,left=400,top=100");
}
