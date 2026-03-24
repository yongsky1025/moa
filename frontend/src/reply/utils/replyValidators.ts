import { hasProfanity } from "../../common/utils/profanityFilter";

export function validateReplyContent(content: string): string {
  if (!content.trim()) return "댓글 내용을 입력해주세요.";
  if (hasProfanity(content)) return "댓글에 사용할 수 없는 표현이 포함되어 있습니다.";
  return "";
}
