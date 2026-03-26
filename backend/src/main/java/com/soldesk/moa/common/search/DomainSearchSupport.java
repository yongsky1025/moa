package com.soldesk.moa.common.search;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.search.dto.SearchQuery;
import com.soldesk.moa.common.search.util.ChosungSearchSettingsUtils;
import com.soldesk.moa.common.search.util.HangulChosungTextUtils;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class DomainSearchSupport<TDocument, THit> {

    private final MeiliSearchOperations meiliSearchOperations;

    protected abstract String indexUid();

    protected abstract String primaryKey();

    protected abstract Class<THit> hitType();

    protected void ensureIndex() {
        meiliSearchOperations.ensureIndex(indexUid(), primaryKey());
    }

    protected boolean isEnabled() {
        return meiliSearchOperations.isEnabled();
    }

    protected long addDocuments(Collection<TDocument> documents) {
        return meiliSearchOperations.addDocuments(indexUid(), documents);
    }

    protected long updateDocuments(Collection<TDocument> documents) {
        return meiliSearchOperations.updateDocuments(indexUid(), documents);
    }

    protected long deleteDocument(String documentId) {
        return meiliSearchOperations.deleteDocument(indexUid(), documentId);
    }

    protected long deleteCurrentIndex() {
        return meiliSearchOperations.deleteIndex(indexUid());
    }

    protected SearchPage<THit> search(SearchQuery query) {
        return meiliSearchOperations.search(indexUid(), query, hitType());
    }

    protected void updateSettings(Map<String, Object> settings) {
        meiliSearchOperations.updateSettings(indexUid(), settings);
    }

    protected List<String> searchableWithChosung(List<String> baseSearchableFields) {
        return ChosungSearchSettingsUtils.withChosungFields(baseSearchableFields);
    }

    protected Map<String, Object> typoToleranceForChosung(List<String> baseFields) {
        return ChosungSearchSettingsUtils.typoToleranceForChosung(baseFields);
    }

    protected String chosungOf(String value) {
        return HangulChosungTextUtils.extract(value);
    }
}
