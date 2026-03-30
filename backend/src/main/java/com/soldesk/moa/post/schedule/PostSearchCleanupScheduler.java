package com.soldesk.moa.post.schedule;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.post.repository.PostSearchRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@RequiredArgsConstructor
@Log4j2
public class PostSearchCleanupScheduler {

    private final PostSearchRepository postSearchRepository;

    @Transactional
    @Scheduled(cron = "0 30 4 * * ?")
    public void cleanupOrphanedPostSearchRows() {
        int deleted = postSearchRepository.deleteOrphanedRows();
        if (deleted > 0) {
            log.info("[SEARCH-CLEANUP] deleted orphaned post_search rows: {}", deleted);
        }
    }
}
