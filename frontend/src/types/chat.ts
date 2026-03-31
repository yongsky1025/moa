export type RoomType = 'DIRECT' | 'GROUP' | 'SCHEDULE';

export interface ChatRoomSummary {
  roomId: number;
  roomType: RoomType;
  circleId: number | null;
  scheduleId: number | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  otherUserNickname: string | null;
  name: string | null;
  noticeMessageId: number | null;
  noticeContent: string | null;
}

export interface ChatMessage {
  messageId: number;
  roomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  messageType?: 'NORMAL' | 'SYSTEM';
}

export interface SendMessageRequest {
  content: string;
}

export interface UnreadCountResponse {
  roomId: number;
  userId: number;
  unreadCount: number;
}
