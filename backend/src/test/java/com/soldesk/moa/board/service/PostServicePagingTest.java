package com.soldesk.moa.board.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.post.dto.PostResponseDTO;
import com.soldesk.moa.board.post.dto.PostSearchPageRequestDTO;
import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.post.service.PostImageService;
import com.soldesk.moa.board.post.service.PostService;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class PostServicePagingTest {

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

    @Captor
    private ArgumentCaptor<Pageable> pageableCaptor;

    @Captor
    private ArgumentCaptor<String> keywordCaptor;

    @Test
    void listGlobalPagedConvertsOneBasedPageToZeroBasedPageable() {
        Post post = Post.builder()
                .postId(10L)
                .title("hello")
                .content("world")
                .boardId(Board.builder().boardId(1L).build())
                .userId(Users.builder().userId(3L).name("tester").build())
                .build();
        when(postRepository.searchPostsWithReplyCount(eq(BoardType.FREE), isNull(), isNull(), eq("abc"),
                org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(new Object[] { post, 2L })));

        PostSearchPageRequestDTO req = new PostSearchPageRequestDTO();
        req.setPage(2);
        req.setSize(5);
        req.setKeyword("  abc  ");

        org.springframework.data.domain.Page<PostResponseDTO> result = postService.listGlobalPaged(BoardType.FREE, req);

        verify(postRepository).searchPostsWithReplyCount(eq(BoardType.FREE), isNull(), isNull(), keywordCaptor.capture(),
                pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertEquals(1, pageable.getPageNumber());
        assertEquals(5, pageable.getPageSize());
        assertEquals("abc", keywordCaptor.getValue());
        assertEquals(1, result.getTotalElements());
        assertEquals(10L, result.getContent().get(0).getPostId());
        assertEquals(2L, result.getContent().get(0).getReplyCount());
    }

    @Test
    void listMethodsDelegateToUnifiedSearchRepository() {
        Post post = Post.builder()
                .postId(1L)
                .title("title")
                .content("body")
                .boardId(Board.builder().boardId(2L).name("notice").build())
                .userId(Users.builder().userId(3L).name("writer").build())
                .build();
        when(postRepository.searchPostsWithReplyCount(eq(BoardType.NOTICE), isNull(), isNull(), isNull(),
                eq(Pageable.unpaged())))
                .thenReturn(new PageImpl<>(Collections.singletonList(new Object[] { post, 0L })));

        List<PostResponseDTO> posts = postService.listGlobal(BoardType.NOTICE);
        List<PostCardResponseDTO> cards = postService.listGlobalCards(BoardType.NOTICE);

        verify(postRepository, times(2)).searchPostsWithReplyCount(eq(BoardType.NOTICE), isNull(), isNull(), isNull(),
                eq(Pageable.unpaged()));
        assertEquals(1, posts.size());
        assertEquals(1, cards.size());
    }
}
