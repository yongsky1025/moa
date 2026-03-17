package com.soldesk.moa.image.cleanup;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.soldesk.moa.board.post.service.PostImageService;
import com.soldesk.moa.board.post.service.PostImageService.CleanupResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
@RequiredArgsConstructor
public class ImageTempCleanUpScheduler {

    private final PostImageService postImageService;

    @Scheduled(cron = "0 30 3 * * ?")
    public void cleanUpOrphanTempImages() {
        CleanupResult result = postImageService.cleanUpOrphanTempImages();
        log.info(
                "image temp cleanup done. candidates={}, deleted={}, failed={}, skipped={}, cutoff={}",
                result.candidateCount(),
                result.deletedCount(),
                result.failedCount(),
                result.skippedCount(),
                result.cutoff());
    }
}
