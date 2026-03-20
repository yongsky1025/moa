import api from "./axiosInstance";
import type { ChatMessage, ChatRoomSummary, UnreadCountResponse } from "../types/chat";

export const chatApi = {
  // 내 채팅방 목록
  getMyRooms: () => api.get<ChatRoomSummary[]>("/api/chat/rooms/my").then((r) => r.data),

  // 메시지 목록 (페이징) - 백엔드가 Page<> 반환하므로 .content 추출
  getMessages: (roomId: number, page = 0, size = 50) =>
    api
      .get<{ content: ChatMessage[] }>(`/api/chat/rooms/${roomId}/messages`, {
        params: { page, size },
      })
      .then((r) => r.data.content ?? []),

  // 읽음 처리
  markAsRead: (roomId: number) => api.post(`/api/chat/rooms/${roomId}/read`),

  // 미읽은 수 (특정 방)
  getUnreadCount: (roomId: number) => api.get<UnreadCountResponse>(`/api/chat/rooms/${roomId}/unread`).then((r) => r.data),

  // 전체 미읽은 수 - 백엔드가 { totalUnread: number } 반환
  getTotalUnread: () => api.get<{ totalUnread: number }>("/api/chat/unread/total").then((r) => r.data.totalUnread),

  // 채팅방 나가기
  leaveRoom: (roomId: number) => api.delete(`/api/chat/rooms/${roomId}/leave`),

  // 1:1 채팅방 조회/생성 - 백엔드가 { roomId: number } 반환
  getOrCreateDirectRoom: (targetUserId: number) =>
    api.post<{ roomId: number }>("/api/chat/rooms/direct", null, { params: { otherId: targetUserId } }).then((r) => r.data.roomId),

  // 그룹 채팅방 조회/생성 - 백엔드가 { roomId: number } 반환
  getOrCreateGroupRoom: (circleId: number) =>
    api.post<{ roomId: number }>("/api/chat/rooms/group", null, { params: { circleId } }).then((r) => r.data.roomId),

  // 일정 채팅방 조회/생성 - 백엔드가 { roomId: number } 반환
  getOrCreateScheduleRoom: (scheduleId: number, scheduleName: string) =>
    api
      .post<{ roomId: number }>('/api/chat/rooms/schedule', null, { params: { scheduleId, scheduleName } })
      .then((r) => r.data.roomId),

  // 메시지 수정
  editMessage: (messageId: number, content: string) => api.patch<ChatMessage>(`/api/chat/messages/${messageId}`, { content }).then((r) => r.data),

  // 메시지 삭제
  deleteMessage: (messageId: number) => api.delete<ChatMessage>(`/api/chat/messages/${messageId}`).then((r) => r.data),

  // 모임 채팅방 이름 변경
  updateRoomName: (roomId: number, name: string) => api.patch(`/api/chat/rooms/${roomId}/name`, { name }),

  // 파일 업로드
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<{ fileUrl: string }>("/api/chat/files", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.fileUrl);
  },
};
