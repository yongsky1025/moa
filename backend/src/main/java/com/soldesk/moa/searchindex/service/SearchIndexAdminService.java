package com.soldesk.moa.searchindex.service;

import org.springframework.stereotype.Service;

import com.soldesk.moa.post.service.PostSearchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchIndexAdminService {

    private final PostSearchService postSearchService;

    public long reindexPosts(Integer batchSize) {
        return postSearchService.reindexAll(batchSize);
    }

    public int normalizeBatchSize(Integer batchSize) {
        if (batchSize == null || batchSize < 1) {
            return 500;
        }
        return Math.min(batchSize, 2000);
    }
}
