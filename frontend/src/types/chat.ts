export type RoomType = 'DIRECT' | 'GROUP';

export interface ChatRoomSummary {
  roomId: number;
  roomType: RoomType;
  circleId: number | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
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
}

export interface SendMessageRequest {
  content: string;
}

export interface UnreadCountResponse {
  roomId: number;
  userId: number;
  unreadCount: number;
}
