package com.soldesk.moa.circle.dto;

import com.soldesk.moa.circle.entity.CircleCategory;
import lombok.Getter;

@Getter
public class CircleCategoryResponseDTO {

    private Long categoryId;
    private String categoryName;

    public CircleCategoryResponseDTO(CircleCategory category) {
        this.categoryId = category.getCategoryId();
        this.categoryName = category.getCategoryName();
    }
}
