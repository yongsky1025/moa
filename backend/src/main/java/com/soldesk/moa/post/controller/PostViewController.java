package com.soldesk.moa.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.post.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostViewController {
    private final PostService postService;

    @PostMapping("/{postId}/view")
    public ResponseEntity<Void> increase(@PathVariable("postId") Long postId, HttpServletRequest request) {
        postService.increaseViewCountOnce(postId, extractClientIp(request));
        return ResponseEntity.noContent().build();
    }

    private String extractClientIp(HttpServletRequest request) {
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank() && !"unknown".equalsIgnoreCase(value.trim());
    }

    private String normalizeIp(String value) {
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
