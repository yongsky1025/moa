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

import com.soldesk.moa.board.dto.BoardDTO;
import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Board;
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
@RequestMapping("/api/board")
@RestController
@RequiredArgsConstructor
public class BoardRestController {

    private final BoardService boardService;

    // 게시판조회 http://localhost:8080/api/board? + GET
    @Operation(summary = "moa_board 조회", description = "moa_board 전제 조회 API - 완료 여부 포함 가능")
    @GetMapping("")
    public List<BoardDTO> getBoard() {
        return boardService.BoardList();
    }

    @Operation(summary = "moa_board 입력", description = "moa_board 입력 API")
    @PostMapping("/add")
    public ResponseEntity<Long> postBoard(@RequestBody BoardDTO dto) {
        log.info("삽입 {}", dto);
        Long BoardId = boardService.create(dto);

        return new ResponseEntity<Long>(BoardId, HttpStatus.OK);
    }

    @Operation(summary = "moa_board 수정", description = "moa_board 수정 API")
    @PutMapping("/{boardId}")
    public Long putPost(
            @Parameter(description = "수정할 board id 값", example = "1", required = true) @PathVariable("boardId") Long boardId,
            @RequestBody BoardDTO dto) {
        log.info("수정 {} {}", boardId, dto);

        dto.setBoardId(boardId);

        return boardService.update(dto);
    }

    @Operation(summary = "moa_board 삭제", description = "moa_board 삭제 API")
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Long> deletePost(@PathVariable("boardId") Long boardId) {
        log.info("삭제{}", boardId);
        boardService.delete(boardId);

        return new ResponseEntity<Long>(boardId, HttpStatus.OK);
    }

}
