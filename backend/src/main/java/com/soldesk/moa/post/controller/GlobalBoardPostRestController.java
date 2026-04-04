package com.soldesk.moa.post.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.post.dto.PostRequestDTO;
import com.soldesk.moa.post.dto.PostResponseDTO;
import com.soldesk.moa.post.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/boards/global/{boardId}/posts")
@RequiredArgsConstructor
public class GlobalBoardPostRestController {

    private final PostService postService;

    @GetMapping
    public List<PostResponseDTO> list(@PathVariable("boardId") Long boardId) {
        return postService.listGlobalByBoardId(boardId);
    }

    @GetMapping("/{postId}")
    public PostResponseDTO read(
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth,
            HttpServletRequest request) {
        PostResponseDTO response = postService.readGlobalByBoardId(
                boardId,
                postId,
                auth != null ? auth.getUserId() : null);
        postService.increaseViewCountOnce(postId, PostClientIpResolver.resolve(request));
        return response;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public Long create(
            @PathVariable("boardId") Long boardId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.createGlobalByBoardId(boardId, auth, req);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{postId}")
    public Long update(
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.updateGlobalByBoardId(boardId, postId, auth, req);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId}")
    public void delete(
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        postService.deleteGlobalByBoardId(boardId, postId, auth);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{postId}/pin")
    public boolean togglePin(
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId) {
        return postService.toggleGlobalBoardPin(boardId, postId);
    }
}
