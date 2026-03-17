package com.soldesk.moa.board.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import com.soldesk.moa.board.common.exception.BadRequestException;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.dto.ReplyRequestDTO;
import com.soldesk.moa.board.reply.entity.Reply;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.board.reply.service.ReplyService;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class ReplyServiceSoftDeleteTest {

    @Mock
    private ReplyRepository replyRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private ReplyService replyService;

    @Test
    void createReplyRejectsDeletedPost() {
        Post post = Post.builder()
                .postId(10L)
                .deleted(true)
                .deletedAt(LocalDateTime.now())
                .boardId(Board.builder().boardId(3L).name("board").build())
                .build();
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        assertThrows(BadRequestException.class, () -> replyService.createReply(10L, 1L, new ReplyRequestDTO("x")));
        verify(usersRepository, never()).findById(1L);
    }

    @Test
    void deleteMarksDeletedAt() {
        Reply reply = Reply.builder()
                .replyId(99L)
                .postId(Post.builder().postId(10L).boardId(Board.builder().boardId(2L).name("b").build()).build())
                .userId(Users.builder().userId(1L).name("u").build())
                .content("hello")
                .depth(0)
                .deleted(false)
                .build();
        when(replyRepository.findById(99L)).thenReturn(Optional.of(reply));

        replyService.delete(99L, 1L);

        assertNotNull(reply.getDeletedAt());
    }
}
