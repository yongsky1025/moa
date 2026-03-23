package com.soldesk.moa.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.post.dto.PostReactionSummaryDTO;
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
        postService.increaseViewCountOnce(postId, PostClientIpResolver.resolve(request));
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{postId}/reactions/like")
    public PostReactionSummaryDTO react(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.reactToPost(postId, auth.getUserId());
    }
}
