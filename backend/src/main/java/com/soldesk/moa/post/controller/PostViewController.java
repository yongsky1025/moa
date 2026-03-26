package com.soldesk.moa.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.post.dto.PostSearchHitDTO;
import com.soldesk.moa.post.dto.PostSearchRequestDTO;
import com.soldesk.moa.post.dto.PostReactionSummaryDTO;
import com.soldesk.moa.post.service.PostSearchService;
import com.soldesk.moa.post.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostViewController {
    private final PostService postService;
    private final PostSearchService postSearchService;

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

    @GetMapping("/search")
    public SearchPage<PostSearchHitDTO> search(@ModelAttribute PostSearchRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO auth) {
        Long userId = auth == null ? null : auth.getUserId();
        return postSearchService.search(request, userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/search/reindex")
    public Map<String, Object> reindex(@RequestParam(value = "batchSize", required = false) Integer batchSize) {
        long indexedCount = postSearchService.reindexAll(batchSize);
        return Map.of(
                "indexedCount", indexedCount,
                "batchSize", batchSize == null ? 500 : Math.min(Math.max(batchSize, 1), 2000));
    }
}
