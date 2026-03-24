package com.soldesk.moa.admin.dashboard.dto.placeInfo;

import java.util.List;

import lombok.Builder;

@Builder
public record AdminPlaceDetailDTO(
        long id,
        String name,
        String address,
        String city,
        String district,
        double latitude,
        double longitude,
        int capacity,
        int pricePerHour,
        String description,
        int openTimeHour,
        int openTimeMinute,
        int closeTimeHour,
        int closeTimeMinute,
        int minReservationMinutes,
        int maxReservationMinutes,
        String status,
        double avgRating,
        int reviewCount,
        List<Long> tagIds,
        List<ClosedDayDTO> closedDays) {

    @Builder
    public record ClosedDayDTO(
            Long id,
            String dayOfWeek,
            String date,
            String reason,
            String closedType) {
    }
}
