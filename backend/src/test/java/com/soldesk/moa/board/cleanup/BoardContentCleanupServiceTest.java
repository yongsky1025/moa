package com.soldesk.moa.board.cleanup;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.cleanup.BoardContentCleanupService.CleanupResult;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.post.entity.PostImage;
import com.soldesk.moa.board.post.repository.PostImageRepository;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.image.entity.Image;
import com.soldesk.moa.image.repository.ImageRepository;
import com.soldesk.moa.image.service.ImageStorageService;
import com.soldesk.moa.users.entity.Users;

@ExtendWith(MockitoExtension.class)
class BoardContentCleanupServiceTest {

    @Mock
    private ReplyRepository replyRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private PostImageRepository postImageRepository;
    @Mock
    private ImageRepository imageRepository;
    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private BoardContentCleanupService cleanupService;

    @Test
    void cleanupDeletesOldSoftDeletedRows() {
        Post post = Post.builder()
                .postId(100L)
                .deleted(true)
                .deletedAt(LocalDateTime.now().minusDays(31))
                .boardId(Board.builder().boardId(11L).name("b").build())
                .userId(Users.builder().userId(3L).name("u").build())
                .title("t")
                .content("c")
                .build();
        Board board = Board.builder()
                .boardId(11L)
                .name("b")
                .deleted(true)
                .deletedAt(LocalDateTime.now().minusDays(31))
                .build();
        Image image = Image.builder().imageId(7L).path("/x.png").build();
        PostImage mapping = PostImage.builder().post(post).image(image).build();

        when(replyRepository.deleteByDeletedTrueAndDeletedAtBefore(any(LocalDateTime.class))).thenReturn(2L);
        when(postRepository.findByDeletedTrueAndDeletedAtBefore(any(LocalDateTime.class))).thenReturn(List.of(post));
        when(boardRepository.findByDeletedTrueAndDeletedAtBefore(any(LocalDateTime.class))).thenReturn(List.of(board));
        when(postImageRepository.findByPost_PostIdOrderBySortOrderAscPostImageIdAsc(100L)).thenReturn(List.of(mapping));
        when(postImageRepository.existsByImage_ImageId(7L)).thenReturn(false);
        when(postRepository.countByBoardId_BoardId(11L)).thenReturn(0L);

        CleanupResult result = cleanupService.cleanupSoftDeletedContents();

        assertEquals(2L, result.deletedReplies());
        assertEquals(1, result.deletedPosts());
        assertEquals(1, result.deletedBoards());
        verify(postRepository).delete(post);
        verify(boardRepository).delete(board);
        verify(replyRepository).deleteByPostId_PostId(100L);
        verify(imageStorageService).deletePostImage(eq("/x.png"));
        verify(imageRepository).deleteById(7L);
    }
}
