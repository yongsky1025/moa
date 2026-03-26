package com.soldesk.moa.chat.dto.response;

import java.time.LocalDateTime;

public record ReadStatusResponse(Long userId, LocalDateTime lastReadAt) {}
