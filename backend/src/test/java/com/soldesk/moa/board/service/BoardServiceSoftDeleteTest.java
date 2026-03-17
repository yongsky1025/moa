package com.soldesk.moa.board.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.board.service.BoardService;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.circle.repository.CircleRepository;

@ExtendWith(MockitoExtension.class)
class BoardServiceSoftDeleteTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private CircleRepository circleRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private ReplyRepository replyRepository;

    @InjectMocks
    private BoardService boardService;

    @Test
    void deleteCircleBoardSoftDeletesBoardAndChildren() {
        Board board = Board.builder()
                .boardId(10L)
                .boardType(BoardType.CIRCLE)
                .name("board")
                .build();

        when(boardRepository.findByBoardIdAndBoardTypeAndCircleId_CircleId(10L, BoardType.CIRCLE, 7L))
                .thenReturn(Optional.of(board));

        boardService.deleteCircleBoard(7L, 10L);

        assertNotNull(board.getDeletedAt());
        verify(postRepository).softDeleteByBoardId(eq(10L), any(LocalDateTime.class));
        verify(replyRepository).softDeleteByBoardId(eq(10L), any(LocalDateTime.class));
    }

    @Test
    void deleteCircleBoardIsIdempotentForAlreadyDeletedBoard() {
        Board board = Board.builder()
                .boardId(10L)
                .boardType(BoardType.CIRCLE)
                .name("board")
                .deleted(true)
                .deletedAt(LocalDateTime.now())
                .build();

        when(boardRepository.findByBoardIdAndBoardTypeAndCircleId_CircleId(10L, BoardType.CIRCLE, 7L))
                .thenReturn(Optional.of(board));

        boardService.deleteCircleBoard(7L, 10L);

        verify(postRepository, never()).softDeleteByBoardId(eq(10L), any(LocalDateTime.class));
        verify(replyRepository, never()).softDeleteByBoardId(eq(10L), any(LocalDateTime.class));
    }
}
