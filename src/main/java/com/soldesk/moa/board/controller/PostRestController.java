package com.soldesk.moa.board.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.board.service.BoardService;
import com.soldesk.moa.board.service.PostService;

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
@RequestMapping("/api/post")
@RestController
@RequiredArgsConstructor
public class PostRestController {

    private final PostService postService;

    // 게시판조회 http://localhost:8080/api/post?boardId={}&postId={} + GET
    @Operation(summary = "moa_post 조회", description = "moa_post 전제 조회 API - 완료 여부 포함 가능")
    @GetMapping("")
    public Object getPost(@RequestParam("boardId") Long boardId,
            @RequestParam(value = "postId", required = false) Long postId) {
        if (postId != null) {
            return postService.findByBoardPostRead(boardId, postId);
        }
        return postService.findByBoardPostList(boardId);
    }

    @Operation(summary = "moa_post 입력", description = "moa_post 입력 API")
    @PostMapping("/add")
    public Long postPost(@RequestBody PostDTO dto) {
        log.info("삽입 {}", dto);
        Long PostId = postService.create(dto);
        return PostId;
    }

    @Operation(summary = "moa_post 수정", description = "moa_post 수정 API")
    @PutMapping("/{postId}")
    public Long putPost(
            @Parameter(description = "수정할 post id 값", example = "1", required = true) @PathVariable("postId") Long postId,
            @RequestBody PostDTO dto) {
        log.info("수정 {} {}", postId, dto);

        dto.setPostId(postId);

        return postService.update(dto);
    }

    @Operation(summary = "moa_post 삭제", description = "moa_post 삭제 API")
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable("postId") Long postId) {
        log.info("삭제{}", postId);
        postService.delete(postId);
        return new ResponseEntity<String>("success", HttpStatus.OK);
    }

}
