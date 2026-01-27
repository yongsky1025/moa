package com.soldesk.moa.board.controller;

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

import com.soldesk.moa.board.dto.PostRequestDTO;
import com.soldesk.moa.board.dto.PostResponseDTO;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.board.service.BoardService;
import com.soldesk.moa.board.service.PostService;
import com.soldesk.moa.users.dto.AuthUserDTO;

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
@RequestMapping("/api/circles/{circleId}/boards/{boardId}/posts")
@RestController
@RequiredArgsConstructor
public class CirclePostRestController {

    private final PostService postService;

    // 써클 보드 리스트
    @GetMapping
    public List<PostResponseDTO> list(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId) {
        return postService.listCircle(circleId, boardId);
    }

    @GetMapping("/{postId}")
    public PostResponseDTO read(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId) {
        return postService.readCircle(circleId, boardId, postId);
    }

    // @PreAuthorize("isAuthenticated()")
    @PostMapping
    public Long create(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.createCircle(circleId, boardId, auth.getUserId(), req);
    }

    // @PreAuthorize("isAuthenticated()")
    @PutMapping("/{postId}")
    public Long update(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.updateCircleAsOwner(circleId, boardId, postId, auth.getUserId(), req);
    }

    // @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId}")
    public void delete(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        postService.deleteCircleAsOwner(circleId, boardId, postId, auth);
    }
}