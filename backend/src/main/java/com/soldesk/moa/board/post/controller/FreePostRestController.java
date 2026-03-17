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
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.post.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RequestMapping("/api/free")
@RestController
@RequiredArgsConstructor
public class FreePostRestController {

    private final PostService postService;

    @GetMapping
    public List<PostResponseDTO> list() {
        return postService.listGlobal(BoardType.FREE);
    }

    @GetMapping("/cards")
    public List<PostCardResponseDTO> listCards() {
        return postService.listGlobalCards(BoardType.FREE);
    }

    @GetMapping("/paged")
    public Page<PostResponseDTO> listPaged(@ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listGlobalPaged(BoardType.FREE, pageRequest);
    }

    @GetMapping("/cards/paged")
    public Page<PostCardResponseDTO> listCardsPaged(@ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listGlobalCardsPaged(BoardType.FREE, pageRequest);
    }

    @GetMapping("/{postId:\\d+}")
    public PostResponseDTO read(@PathVariable("postId") Long postId) {
        return postService.readGlobal(BoardType.FREE, postId);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public Long create(@RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.createGlobal(BoardType.FREE, auth, req);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{postId:\\d+}")
    public Long update(@PathVariable("postId") Long postId,
            @RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.updateFreeAsOwner(postId, auth, req);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId:\\d+}")
    public void delete(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        postService.deleteFreeAsOwner(postId, auth);
    }
}
