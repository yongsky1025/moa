package com.soldesk.moa.board.post.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.post.dto.PostResponseDTO;
import com.soldesk.moa.board.post.dto.PostSearchPageRequestDTO;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.post.service.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportPostRestController {

    private final PostService postService;

    @GetMapping
    public List<PostResponseDTO> list() {
        return postService.listGlobal(BoardType.SUPPORT);
    }

    @GetMapping("/cards")
    public List<PostCardResponseDTO> listCards() {
        return postService.listGlobalCards(BoardType.SUPPORT);
    }

    @GetMapping("/paged")
    public Page<PostResponseDTO> listPaged(@ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listGlobalPaged(BoardType.SUPPORT, pageRequest);
    }

    @GetMapping("/cards/paged")
    public Page<PostCardResponseDTO> listCardsPaged(@ModelAttribute PostSearchPageRequestDTO pageRequest) {
        return postService.listGlobalCardsPaged(BoardType.SUPPORT, pageRequest);
    }

    @GetMapping("/{postId:\\d+}")
    public PostResponseDTO read(@PathVariable("postId") Long postId) {
        return postService.readGlobal(BoardType.SUPPORT, postId);
    }
}
