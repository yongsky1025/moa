package com.soldesk.moa.post.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private ReplyRepository replyRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private CirclePermissionService circlePermissionService;

    @Mock
    private ImageRepository imageRepository;

    @InjectMocks
    private PostService postService;

    @Test
    void deleteGlobal_softDeletesPostAndReplies() {
        Post post = Post.builder()
                .postId(10L)
                .boardId(Board.builder().boardType(BoardType.NOTICE).name("notice").build())
                .userId(Users.builder().userId(1L).name("author").build())
                .title("title")
                .content("content")
                .deleted(false)
                .build();

        when(postRepository.findGlobalPost(BoardType.NOTICE, 10L)).thenReturn(Optional.of(post));

        postService.deleteGlobal(BoardType.NOTICE, 10L);

        assertTrue(post.isDeleted());
        verify(replyRepository).softDeleteByPostId(10L);
        verify(postRepository, never()).delete(post);
        assertEquals("content", post.getContent());
    }
}
