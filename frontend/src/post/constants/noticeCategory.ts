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

interface NoticeCategoryPalette {
  borderColor: string;
  backgroundColor: string;
  color: string;
}

export const NOTICE_CATEGORY_BADGE_PALETTE: Record<NoticeCategory, NoticeCategoryPalette> = {
  ANNOUNCEMENT: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
  },
  EVENT: {
    borderColor: "#fdba74",
    backgroundColor: "#fff7ed",
    color: "#c2410c",
  },
  UPDATE: {
    borderColor: "#99f6e4",
    backgroundColor: "#f0fdfa",
    color: "#0f766e",
  },
};
