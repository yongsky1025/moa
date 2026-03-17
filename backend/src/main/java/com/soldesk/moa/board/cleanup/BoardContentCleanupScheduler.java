package com.soldesk.moa.board.cleanup;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.soldesk.moa.board.cleanup.BoardContentCleanupService.CleanupResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
@RequiredArgsConstructor
public class BoardContentCleanupScheduler {

    private final BoardContentCleanupService cleanupService;

    @Scheduled(cron = "0 30 3 * * ?")
    public void cleanupSoftDeletedContents() {
        CleanupResult result = cleanupService.cleanupSoftDeletedContents();
        log.info(
                "board content cleanup done. deletedReplies={}, postCandidates={}, deletedPosts={}, failedPosts={}, boardCandidates={}, deletedBoards={}, skippedBoards={}, failedImages={}, cutoff={}",
                result.deletedReplies(),
                result.postCandidates(),
                result.deletedPosts(),
                result.failedPosts(),
                result.boardCandidates(),
                result.deletedBoards(),
                result.skippedBoards(),
                result.failedImages(),
                result.cutoff());
    }
}
