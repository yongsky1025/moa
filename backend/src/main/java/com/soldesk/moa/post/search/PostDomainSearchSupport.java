package com.soldesk.moa.post.search;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.soldesk.moa.common.search.DomainSearchSupport;
import com.soldesk.moa.common.search.MeiliSearchOperations;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.search.dto.SearchQuery;
import com.soldesk.moa.post.dto.PostSearchDocument;
import com.soldesk.moa.post.dto.PostSearchHitDTO;

@Component
public class PostDomainSearchSupport extends DomainSearchSupport<PostSearchDocument, PostSearchHitDTO> {

    private static final String INDEX_UID = "posts";
    private static final String PRIMARY_KEY = "id";
    private static final List<String> BASE_SEARCHABLE_FIELDS = List.of("title", "authorName", "content");

    public PostDomainSearchSupport(MeiliSearchOperations meiliSearchOperations) {
        super(meiliSearchOperations);
    }

    @Override
    protected String indexUid() {
        return INDEX_UID;
    }

    @Override
    protected String primaryKey() {
        return PRIMARY_KEY;
    }

    @Override
    protected Class<PostSearchHitDTO> hitType() {
        return PostSearchHitDTO.class;
    }

    public boolean enabled() {
        return isEnabled();
    }

    public void ensureConfigured() {
        ensureIndex();
        updateSettings(Map.of(
                "searchableAttributes", searchableWithChosung(BASE_SEARCHABLE_FIELDS),
                "filterableAttributes", List.of("boardType", "circleId"),
                "sortableAttributes", List.of("createDate", "viewCount", "likeCount"),
                "typoTolerance", typoToleranceForChosung(BASE_SEARCHABLE_FIELDS)));
    }

    public long upsertDocuments(Collection<PostSearchDocument> documents) {
        return updateDocuments(documents);
    }

    public long deleteByPostId(Long postId) {
        if (postId == null) {
            return -1L;
        }
        return deleteDocument(postId.toString());
    }

    public long deleteIndex() {
        return deleteCurrentIndex();
    }

    public SearchPage<PostSearchHitDTO> searchPosts(SearchQuery query) {
        return search(query);
    }

    public String toChosung(String value) {
        return chosungOf(value);
    }
}
