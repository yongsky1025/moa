package com.soldesk.moa.notification.aspect;

import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.board.repository.ReplyRepository;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.service.NotificationService;
import com.soldesk.moa.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class ReplyNotificationAspect {

    private final NotificationService notificationService;
    private final PostRepository postRepository;
    private final ReplyRepository replyRepository;
    private final UsersRepository usersRepository;

    /** 댓글 생성 후 게시글 작성자에게 알림 */
    @AfterReturning("execution(* com.soldesk.moa.board.service.ReplyService.createReply(..))")
    public void notifyOnReply(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        Long postId = (Long) args[0];
        Long commenterId = (Long) args[1];

        postRepository.findById(postId).ifPresent(post -> {
            Long postAuthorId = post.getUserId().getUserId();
            if (postAuthorId.equals(commenterId)) return;

            String commenterNickname = usersRepository.findById(commenterId)
                    .map(u -> u.getNickname())
                    .orElse("누군가");

            notificationService.send(
                    postAuthorId,
                    NotificationType.COMMENT,
                    commenterNickname + "님이 '" + post.getTitle() + "' 게시글에 댓글을 달았습니다."
            );
        });
    }

    /** 대댓글 생성 후 부모 댓글 작성자에게 알림 */
    @AfterReturning("execution(* com.soldesk.moa.board.service.ReplyService.createChildReply(..))")
    public void notifyOnChildReply(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        Long parentReplyId = (Long) args[1];
        Long replierId = (Long) args[2];

        replyRepository.findById(parentReplyId).ifPresent(parent -> {
            Long parentAuthorId = parent.getUserId().getUserId();
            if (parentAuthorId.equals(replierId)) return;

            String replierNickname = usersRepository.findById(replierId)
                    .map(u -> u.getNickname())
                    .orElse("누군가");

            notificationService.send(
                    parentAuthorId,
                    NotificationType.REPLY_COMMENT,
                    replierNickname + "님이 내 댓글에 답글을 달았습니다."
            );
        });
    }
}
