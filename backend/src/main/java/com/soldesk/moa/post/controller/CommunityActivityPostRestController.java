package com.soldesk.moa.post.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.post.dto.CommunityMyReplyDTO;
import com.soldesk.moa.post.dto.PostResponseDTO;
import com.soldesk.moa.post.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/community/activities")
@RequiredArgsConstructor
public class CommunityActivityPostRestController {

    private final PostService postService;

    @GetMapping
    public List<PostResponseDTO> list(@RequestParam(value = "size", required = false) Integer size) {
        return postService.listPublicCircleActivities(size);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my-posts")
    public List<PostResponseDTO> myPosts(@AuthenticationPrincipal AuthUserDTO auth) {
        return postService.listMyMemberPublicActivityPosts(auth.getUserId());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/bookmarks")
    public List<PostResponseDTO> myBookmarks(@AuthenticationPrincipal AuthUserDTO auth) {
        return postService.listMyBookmarkedMemberPublicActivityPosts(auth.getUserId());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my-replies")
    public List<CommunityMyReplyDTO> myReplies(@AuthenticationPrincipal AuthUserDTO auth) {
        return postService.listMyMemberPublicActivityReplies(auth.getUserId());
    }

    @GetMapping("/{postId}")
    public PostResponseDTO read(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth,
            HttpServletRequest request) {
        PostResponseDTO response = postService.readPublicCircleActivity(postId, auth != null ? auth.getUserId() : null);
        postService.increaseViewCountOnce(postId, PostClientIpResolver.resolve(request));
        return response;
    }
}
