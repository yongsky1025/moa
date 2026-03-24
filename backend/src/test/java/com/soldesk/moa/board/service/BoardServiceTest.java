package com.soldesk.moa.board.service;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private CircleRepository circleRepository;

    @Mock
    private CirclePermissionService circlePermissionService;

    @Mock
    private PostRepository postRepository;

    @Mock
    private ReplyRepository replyRepository;

    @InjectMocks
    private BoardService boardService;

    @Test
    void deleteCircleBoard_softDeletesBoardPostsAndReplies() {
        Board board = Board.builder()
                .boardId(30L)
                .boardType(BoardType.CIRCLE)
                .circleId(Circle.builder().circleId(1L).build())
                .name("board")
                .build();

        when(boardRepository.findByBoardIdAndBoardTypeAndCircleId_CircleIdAndDeletedFalse(30L, BoardType.CIRCLE, 1L))
                .thenReturn(Optional.of(board));

        boardService.deleteCircleBoard(1L, 30L, 10L);

        verify(circlePermissionService).requireLeader(1L, 10L);
        verify(replyRepository).softDeleteByBoardId(30L);
        verify(postRepository).softDeleteByBoardId(30L);
        verify(boardRepository, never()).deleteById(anyLong());
    }
}
