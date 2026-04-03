import type { PostFormValues } from "../types/postTypes";
import { hasProfanity, stripHtmlToText } from "../../common/utils/profanityFilter";

const IMG_TAG_PATTERN = /<img\b[^>]*>/i;

export function hasPostBodyContent(html: string): boolean {
  const plainContent = stripHtmlToText(html);
  if (plainContent.length > 0) {
    return true;
  }
  return IMG_TAG_PATTERN.test(html);
}

export function validatePostForm(values: PostFormValues): string {
  const normalizedTitle = values.title.trim();
  if (!normalizedTitle) return "제목을 입력해주세요.";
  if (normalizedTitle.length < 2) return "제목은 2자 이상 입력해주세요.";
  if (normalizedTitle.length > 80) return "제목은 80자 이하로 입력해주세요.";
  const plainContent = stripHtmlToText(values.content);
  if (!hasPostBodyContent(values.content)) return "내용 또는 이미지를 입력해주세요.";
  if (hasProfanity(values.title)) return "제목에 사용할 수 없는 표현이 포함되어 있습니다.";
  if (hasProfanity(plainContent)) return "내용에 사용할 수 없는 표현이 포함되어 있습니다.";
  return "";
}
