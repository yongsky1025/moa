package com.soldesk.moa.notification.domain;

public record ReplyCreatedEvent(
        Long targetUserId,
        NotificationType type,
        String message,
        Long referenceId
) {}
