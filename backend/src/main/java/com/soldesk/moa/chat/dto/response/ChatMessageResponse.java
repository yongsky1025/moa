package com.soldesk.moa.chat.dto.response;

import java.time.LocalDateTime;
import java.util.List;

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
        String replyToNickname,
        List<ReactionSummary> reactions,
        boolean isReported // 신고용 필드
) {
    public record ReactionSummary(String emoji, int count, boolean myReaction) {
    }
}
