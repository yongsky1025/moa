package com.soldesk.moa.board.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.soldesk.moa.board.dto.BoardNameRequestDTO;
import com.soldesk.moa.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.dto.BoardResponseDTO;
import com.soldesk.moa.board.service.BoardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Response Global Board", description = "글로벌 보드 API")
@RestController
@RequestMapping("/api/boards/global")
@RequiredArgsConstructor
public class GlobalBoardRestController {

    private final BoardService boardService;

    @GetMapping
    @Operation(summary = "Global/Board 리스트 조회", description = "글로벌 게시판 리스트 조회 API")
    public List<BoardResponseDTO> list() {
        return boardService.listGlobalBoards();
    }

    @GetMapping("/{boardId}")
    @Operation(summary = "Global/Board 단건 조회", description = "글로벌 게시판 단건 조회 API")
    public BoardResponseDTO read(@PathVariable("boardId") Long boardId) {
        return boardService.readGlobalBoardById(boardId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Global/Board 생성", description = "관리자 전용 글로벌 게시판 생성 API")
    public Long create(@RequestBody @Valid BoardRequestDTO req) {
        return boardService.createGlobalBoard(req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{boardId}")
    @Operation(summary = "Global/Board 수정", description = "관리자 전용 글로벌 게시판 수정 API")
    public Long update(@PathVariable("boardId") Long boardId,
            @RequestBody @Valid BoardNameRequestDTO req) {
        return boardService.updateGlobalBoardName(boardId, req.getName());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{boardId}")
    @Operation(summary = "Global/Board 삭제", description = "관리자 전용 글로벌 게시판 삭제 API")
    public void delete(@PathVariable("boardId") Long boardId) {
        boardService.deleteGlobalBoard(boardId);
    }
}
