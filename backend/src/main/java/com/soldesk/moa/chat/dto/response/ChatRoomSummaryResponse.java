package com.soldesk.moa.chat.dto.response;

import com.soldesk.moa.chat.domain.RoomType;

import java.time.LocalDateTime;

/**
 * 내 채팅방 목록 조회 응답 DTO.
 * - roomId      : 채팅방 ID
 * - roomType    : DIRECT(1:1) / GROUP(모임)
 * - circleId    : 모임 채팅방인 경우 모임 ID (1:1이면 null)
 * - lastMessage : 가장 최근 메시지 내용 (없으면 null)
 * - lastMessageAt : 가장 최근 메시지 시각 (없으면 null)
 * - unreadCount : 읽지 않은 메시지 수
 */
public record ChatRoomSummaryResponse(
        Long roomId,
        RoomType roomType,
        Long circleId,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount
) {}
