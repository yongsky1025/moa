package com.soldesk.moa.chat.dto.response;

import com.soldesk.moa.chat.domain.RoomType;

import java.time.LocalDateTime;

/**
 * 내 채팅방 목록 조회 응답 DTO.
 * - roomId            : 채팅방 ID
 * - roomType          : DIRECT(1:1) / GROUP(모임) / SCHEDULE(일정)
 * - circleId          : 모임 채팅방인 경우 모임 ID (그 외 null)
 * - scheduleId        : 일정 채팅방인 경우 일정 ID (그 외 null)
 * - lastMessage       : 가장 최근 메시지 내용 (없으면 null)
 * - lastMessageAt     : 가장 최근 메시지 시각 (없으면 null)
 * - unreadCount       : 읽지 않은 메시지 수
 * - otherUserNickname : 1:1 채팅방 상대방 닉네임 (그 외 null)
 * - name              : 채팅방 이름 (null이면 기본값 사용)
 */
public record ChatRoomSummaryResponse(
        Long roomId,
        RoomType roomType,
        Long circleId,
        Long scheduleId,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount,
        String otherUserNickname,
        String name,
        Long noticeMessageId,
        String noticeContent
) {}
