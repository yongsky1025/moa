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

  // 방 멤버별 읽음 시각 조회
  getReadStatus: (roomId: number) =>
    api.get<{ userId: number; lastReadAt: string }[]>(`/api/chat/rooms/${roomId}/read-status`).then((r) => r.data),

  // 리액션 토글
  toggleReaction: (messageId: number, emoji: string) =>
    api.post<import('../chat/types/chat').ChatMessage>(`/api/chat/messages/${messageId}/reactions`, null, { params: { emoji } }).then(r => r.data),

  // 즐겨찾기(고정) 토글
  togglePin: (roomId: number) =>
    api.post<{ isPinned: boolean }>(`/api/chat/rooms/${roomId}/pin`).then(r => r.data.isPinned),

  // 공지 설정
  setNotice: (roomId: number, messageId: number) =>
    api.post(`/api/chat/rooms/${roomId}/notice`, { messageId }),

  // 공지 해제
  clearNotice: (roomId: number) =>
    api.delete(`/api/chat/rooms/${roomId}/notice`),

  // 채팅방 멤버 목록 조회 (일정/모임 공통)
  getRoomMembers: (roomId: number) =>
    api.get<{ userId: number; nickname: string; isLeader: boolean }[]>(`/api/chat/rooms/${roomId}/members`).then(r => r.data),

  // AI 스마트 답변 제안
  suggestReply: (roomId: number) =>
    api.post<{ quickReplies: string[]; draft: string }>(`/api/ai/chat/rooms/${roomId}/suggest`).then(r => r.data),

  // 파일 업로드 (이미지: /api/images/upload-url, 일반파일: /api/files/upload-url)
  uploadFile: async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const urlEndpoint = isImage ? "/api/images/upload-url" : "/api/files/upload-url";

    // 1단계: 업로드 URL + key 발급
    const { data } = await api.post<{
      uploadUrl: string;
      fileUrl: string;
      key: string;
      method: string;
      thumbnailUrl?: string;
      thumbnailKey?: string;
    }>(
      urlEndpoint,
      { domain: "CHAT", fileName: file.name, contentType: file.type }
    );

    // 2단계: 실제 파일 업로드
    const form = new FormData();
    form.append("key", data.key);
    form.append("file", file);
    await api.post("/api/local-files/upload", form, { headers: { "Content-Type": undefined } });

    // 상대경로로 정규화 (/uploads/...)
    const idx = data.fileUrl.indexOf("/uploads/");
    return idx >= 0 ? data.fileUrl.substring(idx) : data.fileUrl;
  },
};
