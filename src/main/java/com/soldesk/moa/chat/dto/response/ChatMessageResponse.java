package com.soldesk.moa.chat.dto.response;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long messageId,
        Long roomId,
        Long senderId,
        String content,
        LocalDateTime createdAt
) {}
