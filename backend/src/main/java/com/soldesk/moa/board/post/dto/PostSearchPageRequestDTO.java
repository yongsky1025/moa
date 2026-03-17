package com.soldesk.moa.board.post.dto;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSearchPageRequestDTO {

    private int page = 1;
    private int size = 20;
    private String keyword;

    public Pageable toPageable() {
        int safePage = Math.max(this.page, 1);
        int safeSize = Math.max(this.size, 1);
        return PageRequest.of(safePage - 1, safeSize);
    }

    public String normalizedKeyword() {
        return StringUtils.hasText(keyword) ? keyword.trim() : null;
    }
}
