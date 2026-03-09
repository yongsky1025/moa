package com.soldesk.moa.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CircleDataDTO {

    // 모임 카테고리 이름
    private String categoryName;

    // 카테고리별 모임 개수
    private Long countPerCategory;

}
