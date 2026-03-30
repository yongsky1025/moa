package com.soldesk.moa.admin.dashboard.dto.statistic;

// 모임 카테고리x장소예약
public record CategoryUsageDTO(
        String categoryName,
        long count,
        Double percentage // 전체 예약 대비 비율
) {

}
