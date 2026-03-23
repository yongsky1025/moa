package com.soldesk.moa.common.entity.constant;

import java.util.Locale;

public enum FileDomain {
    COMMON,
    POST,
    CIRCLE,
    USER,
    PLACE,
    CHAT;

    public static FileDomain from(String raw) {
        if (raw == null || raw.isBlank()) {
            return COMMON;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        if ("USERS".equals(normalized)) {
            return USER;
        }
        try {
            return FileDomain.valueOf(normalized);
        } catch (IllegalArgumentException ignored) {
            return COMMON;
        }
    }
}
