export type NotificationType =
  | "CHAT_MESSAGE"
  | "JOIN_REQUEST"
  | "JOIN_APPROVED"
  | "JOIN_REJECTED"
  | "KICKED"
  | "CIRCLE_DISBANDED";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: number;
}
