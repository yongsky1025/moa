package com.soldesk.moa.common.search;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.soldesk.moa.common.exception.InvalidRequestException;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.search.dto.SearchQuery;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RequiredArgsConstructor
public class HttpMeiliSearchOperations implements MeiliSearchOperations {

    private final RestClient meiliSearchMasterRestClient;
    private final RestClient meiliSearchSearchRestClient;
    private final ObjectMapper objectMapper;

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public void ensureIndex(String indexUid, String primaryKey) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("uid", indexUid);
        body.put("primaryKey", primaryKey);

        try {
            meiliSearchMasterRestClient.post()
                    .uri("/indexes")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 409 && isIndexAlreadyExists(e)) {
                return;
            }
            throw new InvalidRequestException("[#SEARCH] Meilisearch index 생성 실패: " + indexUid);
        }
    }

    @Override
    public long addDocuments(String indexUid, Collection<?> documents) {
        if (documents == null || documents.isEmpty()) {
            return -1L;
        }
        return submitDocuments(indexUid, documents, false);
    }

    @Override
    public long updateDocuments(String indexUid, Collection<?> documents) {
        if (documents == null || documents.isEmpty()) {
            return -1L;
        }
        return submitDocuments(indexUid, documents, true);
    }

    @Override
    public long deleteDocument(String indexUid, String documentId) {
        if (documentId == null || documentId.isBlank()) {
            return -1L;
        }

        JsonNode response = meiliSearchMasterRestClient.delete()
                .uri("/indexes/{indexUid}/documents/{documentId}", indexUid, documentId)
                .retrieve()
                .body(JsonNode.class);

        return taskUid(response);
    }

    @Override
    public long deleteIndex(String indexUid) {
        if (indexUid == null || indexUid.isBlank()) {
            return -1L;
        }
        try {
            JsonNode response = meiliSearchMasterRestClient.delete()
                    .uri("/indexes/{indexUid}", indexUid)
                    .retrieve()
                    .body(JsonNode.class);
            return taskUid(response);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 404) {
                return -1L;
            }
            throw e;
        }
    }

    @Override
    public void updateSettings(String indexUid, Map<String, Object> settings) {
        if (settings == null || settings.isEmpty()) {
            return;
        }

        meiliSearchMasterRestClient.patch()
                .uri("/indexes/{indexUid}/settings", indexUid)
                .body(settings)
                .retrieve()
                .toBodilessEntity();
    }

    @Override
    public <T> SearchPage<T> search(String indexUid, SearchQuery query, Class<T> hitType) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("q", defaultString(query.getQ()));

        if (query.getPage() != null) {
            body.put("page", query.getPage());
        }
        if (query.getSize() != null) {
            body.put("hitsPerPage", query.getSize());
        }
        if (query.getFilter() != null && !query.getFilter().isBlank()) {
            body.put("filter", query.getFilter());
        }
        if (query.getSort() != null && !query.getSort().isEmpty()) {
            body.put("sort", query.getSort());
        }
        if (query.getAttributesToRetrieve() != null && !query.getAttributesToRetrieve().isEmpty()) {
            body.put("attributesToRetrieve", query.getAttributesToRetrieve());
        }

        JsonNode response = meiliSearchSearchRestClient.post()
                .uri("/indexes/{indexUid}/search", indexUid)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        JsonNode hitsNode = response == null ? null : response.get("hits");
        List<T> mappedHits = hitsNode == null || !hitsNode.isArray()
                ? List.of()
                : toHits(hitsNode, hitType);

        int requestedPage = query.getPage() == null ? 1 : query.getPage();
        int totalHits = intValue(response, "totalHits", intValue(response, "estimatedTotalHits", 0));
        int responsePage = intValue(response, "page", requestedPage);
        int totalPages = intValue(response, "totalPages", totalHits == 0 ? 0 : 1);

        return SearchPage.<T>builder()
                .hits(mappedHits)
                .totalHits(totalHits)
                .page(responsePage)
                .totalPages(totalPages)
                .processingTimeMs(longValue(response, "processingTimeMs", 0L))
                .query(textValue(response, "query", defaultString(query.getQ())))
                .build();
    }

    private long submitDocuments(String indexUid, Collection<?> documents, boolean partialUpdate) {
        JsonNode response = partialUpdate
                ? meiliSearchMasterRestClient.put()
                        .uri("/indexes/{indexUid}/documents", indexUid)
                        .body(documents)
                        .retrieve()
                        .body(JsonNode.class)
                : meiliSearchMasterRestClient.post()
                        .uri("/indexes/{indexUid}/documents", indexUid)
                        .body(documents)
                        .retrieve()
                        .body(JsonNode.class);

        return taskUid(response);
    }

    private boolean isIndexAlreadyExists(RestClientResponseException e) {
        try {
            JsonNode body = objectMapper.readTree(e.getResponseBodyAsString());
            return "index_already_exists".equals(body.path("code").asText());
        } catch (Exception parseError) {
            log.warn("Meilisearch 에러 응답 파싱 실패", parseError);
            return false;
        }
    }

    private long taskUid(JsonNode response) {
        if (response == null) {
            return -1L;
        }
        return response.path("taskUid").asLong(-1L);
    }

    private <T> List<T> toHits(JsonNode hitsNode, Class<T> hitType) {
        return objectMapper.convertValue(
                hitsNode,
                objectMapper.getTypeFactory().constructCollectionType(List.class, hitType));
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String textValue(JsonNode source, String key, String defaultValue) {
        if (source == null) {
            return defaultValue;
        }
        JsonNode node = source.get(key);
        if (node == null || node.isNull()) {
            return defaultValue;
        }
        return node.asText(defaultValue);
    }

    private int intValue(JsonNode source, String key, int defaultValue) {
        if (source == null) {
            return defaultValue;
        }
        JsonNode node = source.get(key);
        if (node == null || node.isNull()) {
            return defaultValue;
        }
        return node.asInt(defaultValue);
    }

    private long longValue(JsonNode source, String key, long defaultValue) {
        if (source == null) {
            return defaultValue;
        }
        JsonNode node = source.get(key);
        if (node == null || node.isNull()) {
            return defaultValue;
        }
        return node.asLong(defaultValue);
    }
}
