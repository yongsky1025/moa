package com.soldesk.moa.common.search;

import java.util.Collection;
import java.util.Map;

import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.search.dto.SearchQuery;

public interface MeiliSearchOperations {

    boolean isEnabled();

    void ensureIndex(String indexUid, String primaryKey);

    long addDocuments(String indexUid, Collection<?> documents);

    long updateDocuments(String indexUid, Collection<?> documents);

    long deleteDocument(String indexUid, String documentId);

    long deleteIndex(String indexUid);

    void updateSettings(String indexUid, Map<String, Object> settings);

    <T> SearchPage<T> search(String indexUid, SearchQuery query, Class<T> hitType);
}
