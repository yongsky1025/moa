export type NotificationType =
  | "CHAT_MESSAGE"
  | "JOIN_REQUEST"
  | "JOIN_APPROVED"
  | "JOIN_REJECTED"
  | "KICKED"
  | "CIRCLE_DISBANDED"
  | "REPLY"
  | "CHILD_REPLY"
  | "POST_LIKE"
  | "REPLY_LIKE"
  | "REPORT_SUBMITTED";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: number;
}
