export type NotificationType =
  | 'CHAT_MESSAGE'
  | 'CIRCLE_JOIN_REQUEST'
  | 'CIRCLE_JOIN_APPROVED'
  | 'CIRCLE_JOIN_REJECTED'
  | 'CIRCLE_KICKED'
  | 'CIRCLE_DISBANDED';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
