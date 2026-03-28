package com.soldesk.moa.chat.dto.response;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long messageId,
        Long roomId,
        Long senderId,
        String senderNickname,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean isDeleted,
        Long replyToId,
        String replyToContent,
        String replyToNickname
) {}
