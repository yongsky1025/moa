package com.soldesk.moa.admin.dashboard.dto.statistic;

// 총 일정 대비 얼마나 장소를 대여하는지
public record PlaceConversionRateDTO(
        Double rate,
        long linkedSchedules,
        long totalSchedules) {

}
