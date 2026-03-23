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

import com.soldesk.moa.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.dto.BoardResponseDTO;
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
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Response Circle Board", description = "써클 보드 API")
@Log4j2
@RequestMapping("/api/circle/{circleId}/boards")
@RestController
@RequiredArgsConstructor
public class CircleBoardRestController {

    private final BoardService boardService;

    // 써클 내 게시판 목록
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Circle/Board 리스트 조회", description = "해당 써클의 게시판 리스트 조회 API")
    @GetMapping
    public List<BoardResponseDTO> list(@PathVariable("circleId") Long circleId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return boardService.listCircleBoards(circleId, auth.getUserId());
    }

    // 게시판 생성 (일단 로그인만 컷, 방장/관리자 확장은 나중에)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Circle/Board 생성", description = "해당 써클의 게시판 추가 API")
    @PostMapping
    public Long create(@PathVariable("circleId") Long circleId,
            @RequestBody @Valid BoardRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {

        // boardType은 무조건 CIRCLE로 강제
        req.setBoardType(BoardType.CIRCLE);
        req.setCircleId(circleId);

        return boardService.createCircleBoard(req, auth.getUserId());
    }

    // 게시판 이름 변경
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Circle/Board 수정", description = "해당 써클의 게시판 수정 - 제목 API")
    @PutMapping("/{boardId}")
    public Long update(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @RequestBody @Valid BoardRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {

        return boardService.updateCircleBoardName(circleId, boardId, req.getName(), auth.getUserId());
    }

    // 게시판 삭제
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Circle/Board 삭제", description = "해당 써클의 게시판 삭제 API")
    @DeleteMapping("/{boardId}")
    public void delete(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @AuthenticationPrincipal AuthUserDTO auth) {

        boardService.deleteCircleBoard(circleId, boardId, auth.getUserId());
    }
}
