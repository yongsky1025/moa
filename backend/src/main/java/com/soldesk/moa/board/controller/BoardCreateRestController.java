package com.soldesk.moa.board.controller;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.board.dto.BoardCreateRequestDTO;
import com.soldesk.moa.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.dto.BoardScope;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.service.BoardService;
import com.soldesk.moa.users.entity.constant.UserRole;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardCreateRestController {

    private final BoardService boardService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public Long create(
            @RequestBody @Valid BoardCreateRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {

        BoardRequestDTO payload = BoardRequestDTO.builder()
                .name(req.getName())
                .circleBoardKind(req.getCircleBoardKind())
                .build();

        if (req.getScope() == BoardScope.CIRCLE) {
            payload.setBoardType(BoardType.CIRCLE);
            payload.setCircleId(req.getCircleId());
            return boardService.createCircleBoard(payload, auth.getUserId());
        }

        if (auth.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("[#BOARD] 글로벌 게시판 생성은 관리자만 가능합니다.");
        }

        payload.setBoardType(BoardType.FREE);
        payload.setCircleId(null);
        return boardService.createGlobalBoard(payload);
    }
}
