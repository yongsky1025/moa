package com.soldesk.moa.admin.dashboard.dto.statistic;

// 지역별 장소 통계(구/군)
public record DistrictDistDTO(
        String city,
        String district,
        long count,
        Double percentage, // 해당 시/도 내 비율
        Double monthOverMonthChange // 전월대비 증감률
) {
}
