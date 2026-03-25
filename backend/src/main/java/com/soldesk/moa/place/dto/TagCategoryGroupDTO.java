package com.soldesk.moa.place.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record TagCategoryGroupDTO(
        Long categoryId,
        String categoryName,
        List<TagResponseDTO> tags) {
}
