package com.soldesk.moa.board.post.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.post.dto.PostRequestDTO;
import com.soldesk.moa.board.post.dto.PostResponseDTO;
import com.soldesk.moa.board.post.dto.PostSearchPageRequestDTO;
import com.soldesk.moa.board.post.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RequestMapping("/api/circle/{circleId}")
@RestController
@RequiredArgsConstructor
public class CirclePostRestController {

    private final PostService postService;

    @GetMapping("/posts")
    public List<PostResponseDTO> listAllBoards(@PathVariable("circleId") Long circleId) {
        return postService.listCircleAllBoardsPosts(circleId);
    }

    @GetMapping("/posts/cards")
    public List<PostCardResponseDTO> listAllBoardCards(@PathVariable("circleId") Long circleId) {
        return postService.listCircleCards(circleId, null);
    }

    @GetMapping("/posts/paged")
    public Page<PostResponseDTO> listAllBoardsPaged(@PathVariable("circleId") Long circleId,
            @ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listCirclePaged(circleId, null, pageRequest);
    }

    @GetMapping("/posts/cards/paged")
    public Page<PostCardResponseDTO> listAllBoardCardsPaged(@PathVariable("circleId") Long circleId,
            @ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listCircleCardsPaged(circleId, null, pageRequest);
    }

    @GetMapping("/boards/{boardId}/posts")
    public List<PostResponseDTO> list(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId) {
        return postService.listCircle(circleId, boardId);
    }

    @GetMapping("/boards/{boardId}/posts/cards")
    public List<PostCardResponseDTO> listCards(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId) {
        return postService.listCircleCards(circleId, boardId);
    }

    @GetMapping("/boards/{boardId}/posts/paged")
    public Page<PostResponseDTO> listPaged(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listCirclePaged(circleId, boardId, pageRequest);
    }

    @GetMapping("/boards/{boardId}/posts/cards/paged")
    public Page<PostCardResponseDTO> listCardsPaged(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listCircleCardsPaged(circleId, boardId, pageRequest);
    }

    @GetMapping("/boards/{boardId}/posts/{postId:\\d+}")
    public PostResponseDTO read(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId) {
        return postService.readCircle(circleId, boardId, postId);
    }

    @PostMapping("/boards/{boardId}/posts")
    @PreAuthorize("isAuthenticated()")
    public Long create(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.createCircle(circleId, boardId, auth.getUserId(), req);
    }

    @PutMapping("/boards/{boardId}/posts/{postId:\\d+}")
    @PreAuthorize("isAuthenticated()")
    public Long update(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.updateCircleAsOwner(circleId, boardId, postId, auth.getUserId(), req);
    }

    @DeleteMapping("/boards/{boardId}/posts/{postId:\\d+}")
    @PreAuthorize("isAuthenticated()")
    public void delete(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        postService.deleteCircleAsOwner(circleId, boardId, postId, auth);
    }
}
