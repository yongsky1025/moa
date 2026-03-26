package com.soldesk.moa.common.search.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchPage<T> {

    private final List<T> hits;
    private final int totalHits;
    private final int page;
    private final int totalPages;
    private final long processingTimeMs;
    private final String query;
}

