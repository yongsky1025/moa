package com.soldesk.moa.board.schedule;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.repository.ReplyReactionRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@RequiredArgsConstructor
@Log4j2
public class SoftDeletedContentCleanupScheduler {

    private final ReplyRepository replyRepository;
    private final ReplyReactionRepository replyReactionRepository;
    private final PostRepository postRepository;
    private final BoardRepository boardRepository;

    // 매일 새벽 4시에 deleted=true 이고 30일 지난 board/post/reply를 물리 삭제
    // image 파일/DB 정리는 OrphanImageCleanupScheduler에서 담당
    @Transactional
    @Scheduled(cron = "0 0 4 * * ?")
    public void purgeSoftDeletedContent() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        int unlinkedParents = replyRepository.unlinkParentReferencesForHardDelete(cutoff);
        int deletedReplyReactions = replyReactionRepository.deleteBySoftDeletedReplyBefore(cutoff);
        int deletedReplies = replyRepository.hardDeleteSoftDeletedBefore(cutoff);
        int deletedPosts = postRepository.hardDeleteSoftDeletedBefore(cutoff);
        int deletedBoards = boardRepository.hardDeleteSoftDeletedBefore(cutoff);

        if (unlinkedParents > 0 || deletedReplyReactions > 0 || deletedReplies > 0 || deletedPosts > 0
                || deletedBoards > 0) {
            log.info("[CLEANUP] cutoff={}, unlinkedParents={}, replyReactions={}, replies={}, posts={}, boards={}",
                    cutoff, unlinkedParents, deletedReplyReactions, deletedReplies, deletedPosts, deletedBoards);
        }
    }
}
