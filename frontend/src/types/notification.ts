export type NotificationType =
  | "CHAT_MESSAGE"
  | "CIRCLE_JOIN_REQUEST"
  | "CIRCLE_JOIN_APPROVED"
  | "CIRCLE_JOIN_REJECTED"
  | "CIRCLE_KICKED"
  | "CIRCLE_DISBANDED"
  | "COMMENT"
  | "REPLY_COMMENT";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
