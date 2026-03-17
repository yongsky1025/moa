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
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.post.service.PostImageService;
import com.soldesk.moa.board.post.service.PostService;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class PostServiceSoftDeleteTest {

    @Mock
    private PostRepository postRepository;
    @Mock
    private ReplyRepository replyRepository;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private UsersRepository usersRepository;
    @Mock
    private PostImageService postImageService;

    @InjectMocks
    private PostService postService;

    @Test
    void deleteGlobalSoftDeletesPostAndReplies() {
        Post post = Post.builder()
                .postId(22L)
                .boardId(Board.builder().boardId(1L).boardType(BoardType.NOTICE).name("공지").build())
                .userId(Users.builder().userId(5L).name("writer").build())
                .title("t")
                .content("c")
                .build();
        when(postRepository.findGlobalPostIncludingDeleted(BoardType.NOTICE, 22L)).thenReturn(Optional.of(post));

        postService.deleteGlobal(BoardType.NOTICE, 22L);

        assertNotNull(post.getDeletedAt());
        verify(replyRepository).softDeleteByPostId(eq(22L), any(LocalDateTime.class));
    }

    @Test
    void deleteGlobalIsIdempotentWhenAlreadySoftDeleted() {
        Post post = Post.builder()
                .postId(22L)
                .deleted(true)
                .deletedAt(LocalDateTime.now())
                .boardId(Board.builder().boardId(1L).boardType(BoardType.NOTICE).name("공지").build())
                .userId(Users.builder().userId(5L).name("writer").build())
                .title("t")
                .content("c")
                .build();
        when(postRepository.findGlobalPostIncludingDeleted(BoardType.NOTICE, 22L)).thenReturn(Optional.of(post));

        postService.deleteGlobal(BoardType.NOTICE, 22L);

        verify(replyRepository, never()).softDeleteByPostId(eq(22L), any(LocalDateTime.class));
    }
}
