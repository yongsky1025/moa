import { hasProfanity } from "../../common/utils/profanityFilter";

export function validateBoardName(name: string): string {
  if (!name.trim()) return "게시판 이름을 입력해주세요.";
  if (hasProfanity(name)) return "게시판 이름에 사용할 수 없는 표현이 포함되어 있습니다.";
  return "";
}

