package com.soldesk.moa.post.controller;

import jakarta.servlet.http.HttpServletRequest;

public final class PostClientIpResolver {

    private PostClientIpResolver() {
    }

    public static String resolve(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (hasText(xForwardedFor)) {
            return normalizeIp(xForwardedFor.split(",")[0].trim());
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (hasText(xRealIp)) {
            return normalizeIp(xRealIp.trim());
        }

        return normalizeIp(request.getRemoteAddr());
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank() && !"unknown".equalsIgnoreCase(value.trim());
    }

    private static String normalizeIp(String value) {
        if (value == null) {
            return "";
        }

        String candidate = value.trim();
        if (candidate.startsWith("[") && candidate.contains("]:")) {
            return candidate.substring(1, candidate.indexOf("]:"));
        }

        if (candidate.contains(".") && candidate.chars().filter(ch -> ch == ':').count() == 1) {
            return candidate.substring(0, candidate.lastIndexOf(':'));
        }

        return candidate;
    }
}
