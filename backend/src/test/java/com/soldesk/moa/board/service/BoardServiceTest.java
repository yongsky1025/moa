package com.soldesk.moa.board.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.soldesk.moa.board.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.board.dto.BoardResponseDTO;
import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.board.service.BoardService;
import com.soldesk.moa.circle.repository.CircleRepository;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private CircleRepository circleRepository;

    @InjectMocks
    private BoardService boardService;

    @Test
    void listGlobalBoardsReturnsNoticeAndFreeOnly() {
        when(boardRepository.findByBoardTypeAndCircleIdIsNull(BoardType.NOTICE))
                .thenReturn(Optional.of(Board.builder().boardId(1L).boardType(BoardType.NOTICE).name("공지사항").build()));
        when(boardRepository.findByBoardTypeAndCircleIdIsNull(BoardType.FREE))
                .thenReturn(Optional.of(Board.builder().boardId(2L).boardType(BoardType.FREE).name("자유게시판").build()));

        var result = boardService.listGlobalBoards();

        assertEquals(2, result.size());
        assertEquals(BoardType.NOTICE, result.get(0).getBoardType());
        assertEquals(BoardType.FREE, result.get(1).getBoardType());
        verify(boardRepository).findByBoardTypeAndCircleIdIsNull(BoardType.NOTICE);
        verify(boardRepository).findByBoardTypeAndCircleIdIsNull(BoardType.FREE);
    }

    @Test
    void createCircleBoardRequiresCircleId() {
        BoardRequestDTO req = BoardRequestDTO.builder()
                .boardType(BoardType.CIRCLE)
                .name("circle board")
                .circleId(null)
                .build();

        assertThrows(IllegalArgumentException.class, () -> boardService.createCircleBoard(req));
    }

    @Test
    void readCircleBoardUsesCircleScope() {
        when(boardRepository.findByBoardIdAndBoardTypeAndCircleId_CircleId(eq(10L), eq(BoardType.CIRCLE), eq(3L)))
                .thenReturn(Optional.of(Board.builder().boardId(10L).boardType(BoardType.CIRCLE).name("동아리").build()));

        BoardResponseDTO result = boardService.readCircleBoard(3L, 10L);

        assertEquals(10L, result.getBoardId());
        assertEquals(BoardType.CIRCLE, result.getBoardType());
    }
}
