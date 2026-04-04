package com.soldesk.moa.common.entity.constant;

import java.util.Locale;

public enum ImageDomain {
    COMMON,
    POST,
    CIRCLE,
    USER,
    PLACE,
    CHAT,
    REPORT,
    PLACE_REVIEW,
    SCHEDULE_REVIEW;

    public static ImageDomain from(String raw) {
        if (raw == null || raw.isBlank()) {
            return COMMON;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        if ("USERS".equals(normalized)) {
            return USER;
        }
        try {
            return ImageDomain.valueOf(normalized);
        } catch (IllegalArgumentException ignored) {
            return COMMON;
        }
    }
}
