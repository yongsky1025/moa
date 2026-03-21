package com.soldesk.moa.reply.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.exception.ReplyForbiddenException;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class ReplyServiceTest {

    @Mock
    private ReplyRepository replyRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private CirclePermissionService circlePermissionService;

    @InjectMocks
    private ReplyService replyService;

    @Test
    void list_requiresActiveMember_whenCirclePost() {
        Post circlePost = createPost(100L, BoardType.CIRCLE, 1L);
        when(postRepository.findById(100L)).thenReturn(Optional.of(circlePost));
        when(replyRepository.findByPostId_PostIdOrderByCreateDateAsc(100L)).thenReturn(java.util.List.of());

        replyService.list(100L, 10L);

        verify(circlePermissionService).requireActiveMember(1L, 10L);
    }

    @Test
    void delete_allowsLeaderModeration_onCircleReply() {
        Reply reply = createReply(50L, 20L, BoardType.CIRCLE, 1L);
        when(replyRepository.findById(50L)).thenReturn(Optional.of(reply));
        when(circlePermissionService.canEditOwnContent(20L, 10L)).thenReturn(false);

        replyService.delete(50L, 10L);

        verify(circlePermissionService).requireActiveMember(1L, 10L);
        verify(circlePermissionService).requireLeader(1L, 10L);
        assertEquals("삭제된 댓글입니다.", reply.getContent());
    }

    @Test
    void delete_throwsWhenNotOwnerAndNotLeader_onCircleReply() {
        Reply reply = createReply(50L, 20L, BoardType.CIRCLE, 1L);
        when(replyRepository.findById(50L)).thenReturn(Optional.of(reply));
        when(circlePermissionService.canEditOwnContent(20L, 10L)).thenReturn(false);
        doThrow(new AccessDeniedException("forbidden")).when(circlePermissionService).requireLeader(1L, 10L);

        assertThrows(AccessDeniedException.class, () -> replyService.delete(50L, 10L));
    }

    @Test
    void delete_globalReply_stillOwnerOnly() {
        Reply reply = createReply(51L, 20L, BoardType.FREE, null);
        when(replyRepository.findById(51L)).thenReturn(Optional.of(reply));
        when(circlePermissionService.canEditOwnContent(20L, 10L)).thenReturn(false);

        assertThrows(ReplyForbiddenException.class, () -> replyService.delete(51L, 10L));
    }

    private Reply createReply(Long replyId, Long ownerId, BoardType boardType, Long circleId) {
        Users owner = Users.builder().userId(ownerId).name("owner").build();
        Post post = createPost(200L, boardType, circleId);
        return Reply.builder()
                .replyId(replyId)
                .userId(owner)
                .postId(post)
                .content("before")
                .depth(0)
                .deleted(false)
                .build();
    }

    private Post createPost(Long postId, BoardType boardType, Long circleId) {
        Circle circle = circleId == null ? null : Circle.builder().circleId(circleId).build();
        Board board = Board.builder()
                .boardType(boardType)
                .circleId(circle)
                .build();
        return Post.builder()
                .postId(postId)
                .boardId(board)
                .userId(Users.builder().userId(1L).name("author").build())
                .title("title")
                .content("content")
                .build();
    }
}
