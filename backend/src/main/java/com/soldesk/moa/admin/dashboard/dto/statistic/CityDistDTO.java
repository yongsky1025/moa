package com.soldesk.moa.admin.dashboard.dto.statistic;

// 지역분포(시/도)
public record CityDistDTO(
        String city,
        long count,
        Double percentage) {
}
