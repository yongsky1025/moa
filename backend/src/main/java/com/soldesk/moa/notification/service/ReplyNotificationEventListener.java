package com.soldesk.moa.notification.service;

import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.domain.ReplyCreatedEvent;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ReplyNotificationEventListener {

    private final NotificationService notificationService;
    private final PostRepository postRepository;
    private final ReplyRepository replyRepository;
    private final UsersRepository usersRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handle(ReplyCreatedEvent event) {
        notificationService.send(event.targetUserId(), event.type(), event.message(), event.referenceId());
    }

    /** Aspect에서 댓글 저장 커밋 후 호출 — 별도 트랜잭션으로 알림 저장 */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onReplyCreated(Long postId, Long writerId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null || post.getUserId() == null) return;

        Long postAuthorId = post.getUserId().getUserId();
        if (postAuthorId.equals(writerId)) return;

        Users writer = usersRepository.findById(writerId).orElse(null);
        if (writer == null) return;

        notificationService.send(postAuthorId, NotificationType.REPLY,
                writer.getName() + "님이 회원님의 게시글에 댓글을 달았습니다.", postId);
    }

    /** Aspect에서 대댓글 저장 커밋 후 호출 — 별도 트랜잭션으로 알림 저장 */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onChildReplyCreated(Long parentReplyId, Long writerId) {
        Reply parent = replyRepository.findById(parentReplyId).orElse(null);
        if (parent == null || parent.getUserId() == null) return;

        Long parentAuthorId = parent.getUserId().getUserId();
        if (parentAuthorId.equals(writerId)) return;

        Users writer = usersRepository.findById(writerId).orElse(null);
        if (writer == null) return;

        notificationService.send(parentAuthorId, NotificationType.CHILD_REPLY,
                writer.getName() + "님이 회원님의 댓글에 대댓글을 달았습니다.",
                parent.getPostId().getPostId());
    }
}
