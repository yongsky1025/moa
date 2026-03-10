package com.soldesk.moa.chat.dto.response;

public record UnreadCountResponse(Long roomId, Long userId, long unreadCount) {}
