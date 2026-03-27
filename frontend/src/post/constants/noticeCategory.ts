export const NOTICE_CATEGORY_OPTIONS = [
  { value: "ANNOUNCEMENT", label: "공지" },
  { value: "EVENT", label: "이벤트" },
  { value: "UPDATE", label: "업데이트" },
] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORY_OPTIONS)[number]["value"];

export const NOTICE_CATEGORY_LABEL: Record<NoticeCategory, string> = {
  ANNOUNCEMENT: "공지",
  EVENT: "이벤트",
  UPDATE: "업데이트",
};
