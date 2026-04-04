package com.soldesk.moa.searchindex.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.searchindex.service.SearchIndexAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/search-indexes")
@RequiredArgsConstructor
public class SearchIndexAdminController {

    private final SearchIndexAdminService searchIndexAdminService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/posts/reindex")
    public Map<String, Object> reindexPosts(
            @RequestParam(value = "batchSize", required = false) Integer batchSize) {
        long indexedCount = searchIndexAdminService.reindexPosts(batchSize);
        return Map.of(
                "indexedCount", indexedCount,
                "batchSize", searchIndexAdminService.normalizeBatchSize(batchSize));
    }
}
