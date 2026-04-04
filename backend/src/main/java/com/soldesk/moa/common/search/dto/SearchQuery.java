package com.soldesk.moa.common.search.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchQuery {

    @Builder.Default
    private final String q = "";

    private final Integer page;
    private final Integer size;
    private final String filter;
    private final List<String> sort;
    private final List<String> attributesToSearchOn;
    private final List<String> attributesToRetrieve;
}

