import type { PostFormValues } from "../types/postTypes";

export function validatePostForm(values: PostFormValues): string {
  if (!values.title.trim()) return "제목을 입력해주세요.";
  if (!values.content.trim()) return "내용을 입력해주세요.";
  return "";
}
