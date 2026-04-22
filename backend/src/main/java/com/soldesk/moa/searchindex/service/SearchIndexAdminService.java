package com.soldesk.moa.searchindex.service;

import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.stereotype.Service;

import com.soldesk.moa.common.exception.InvalidRequestException;
import com.soldesk.moa.post.service.PostSearchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchIndexAdminService {

    private final PostSearchService postSearchService;
    private final AtomicBoolean postReindexInProgress = new AtomicBoolean(false);

    public long reindexPosts(Integer batchSize) {
        if (!postReindexInProgress.compareAndSet(false, true)) {
            throw new InvalidRequestException("[#SEARCH] 게시글 재색인이 이미 실행 중입니다.");
        }
        try {
            return postSearchService.reindexAll(batchSize, true);
        } finally {
            postReindexInProgress.set(false);
        }
    }

    public int normalizeBatchSize(Integer batchSize) {
        if (batchSize == null || batchSize < 1) {
            return 500;
        }
        return Math.min(batchSize, 2000);
    }
}
