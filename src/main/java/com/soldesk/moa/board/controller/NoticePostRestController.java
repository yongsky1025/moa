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
@RequestMapping("/api/notice/posts")
@RestController
@RequiredArgsConstructor
public class NoticePostRestController {

    private final PostService postService;

    @GetMapping
    public List<PostResponseDTO> list() {
        return postService.listGlobal(BoardType.NOTICE);
    }

    @GetMapping("/{postId}")
    public PostResponseDTO read(@PathVariable("postId") Long postId) {
        return postService.readGlobal(BoardType.NOTICE, postId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Long create(@RequestBody @Valid PostRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.createGlobal(BoardType.NOTICE, auth, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{postId}")
    public Long update(@PathVariable("postId") Long postId,
            @RequestBody @Valid PostRequestDTO req) {
        return postService.updateGlobal(BoardType.NOTICE, postId, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{postId}")
    public void delete(@PathVariable("postId") Long postId) {
        postService.deleteGlobal(BoardType.NOTICE, postId);
    }
}
