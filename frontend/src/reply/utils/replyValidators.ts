export function validateReplyContent(content: string): string {
  if (!content.trim()) return "댓글 내용을 입력해주세요.";
  return "";
}
