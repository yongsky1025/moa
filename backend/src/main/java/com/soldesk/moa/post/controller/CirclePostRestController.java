package com.soldesk.moa.post.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.service.BoardService;
import com.soldesk.moa.post.dto.PostRequestDTO;
import com.soldesk.moa.post.dto.PostResponseDTO;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.post.service.PostService;
import com.soldesk.moa.auth.dto.AuthUserDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Log4j2
@RequestMapping("/api/circle/{circleId}")
@RestController
@RequiredArgsConstructor
public class CirclePostRestController {

    private final PostService postService;

    // 써클 전체 게시물
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/posts")
    public List<PostResponseDTO> listAllBoards(@PathVariable("circleId") Long circleId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.listCircleAllBoardsPosts(circleId, auth.getUserId());
    }

    // 써클 Board, Post 리스트
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/boards/{boardId}/posts")
    public List<PostResponseDTO> list(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.listCircle(circleId, boardId, auth.getUserId());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/boards/{boardId}/posts/{postId}")
    public PostResponseDTO read(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.readCircle(circleId, boardId, postId, auth.getUserId());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/boards/{boardId}/posts")
    public Long create(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.createCircle(circleId, boardId, auth.getUserId(), req);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/boards/{boardId}/posts/{postId}")
    public Long update(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.updateCircleAsOwner(circleId, boardId, postId, auth.getUserId(), req);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/boards/{boardId}/posts/{postId}")
    public void delete(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        postService.deleteCircleAsOwner(circleId, boardId, postId, auth);
    }
}
