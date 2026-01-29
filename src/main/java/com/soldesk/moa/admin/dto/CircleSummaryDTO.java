package com.soldesk.moa.admin.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CircleSummaryDTO {

    // 전체 모임 수
    private Long circleCount;

    // 카테고리 별 모임 분포
    @Builder.Default
    private List<CircleDataDTO> circleDataDTOs = new ArrayList<>();

}
