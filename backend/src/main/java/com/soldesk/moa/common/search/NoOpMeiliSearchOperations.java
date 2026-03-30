package com.soldesk.moa.common.search;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.search.dto.SearchQuery;

public class NoOpMeiliSearchOperations implements MeiliSearchOperations {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public void ensureIndex(String indexUid, String primaryKey) {
    }

    @Override
    public long addDocuments(String indexUid, Collection<?> documents) {
        return -1L;
    }

    @Override
    public long updateDocuments(String indexUid, Collection<?> documents) {
        return -1L;
    }

    @Override
    public long deleteDocument(String indexUid, String documentId) {
        return -1L;
    }

    @Override
    public long deleteIndex(String indexUid) {
        return -1L;
    }

    @Override
    public void updateSettings(String indexUid, Map<String, Object> settings) {
    }

    @Override
    public <T> SearchPage<T> search(String indexUid, SearchQuery query, Class<T> hitType) {
        return SearchPage.<T>builder()
                .hits(List.of())
                .totalHits(0)
                .page(query.getPage() == null ? 1 : query.getPage())
                .totalPages(0)
                .processingTimeMs(0L)
                .query(query.getQ())
                .build();
    }
}
