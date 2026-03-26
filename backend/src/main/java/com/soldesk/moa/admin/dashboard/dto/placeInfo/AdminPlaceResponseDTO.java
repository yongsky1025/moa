package com.soldesk.moa.admin.dashboard.dto.placeInfo;

import lombok.Builder;

@Builder
public record AdminPlaceResponseDTO(
        long id,
        String name,
        String address,
        String city,
        String district,
        String dong,
        int capacity,
        int pricePerHour,
        double avgRating,
        int reviewCount,
        String status) {
}
