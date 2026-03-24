package com.soldesk.moa.place.dto;

import lombok.Builder;

@Builder
public record PlaceResponseDTO(
        long id,
        String name,
        String address,
        String city,
        String district,
        int capacity,
        int pricePerHour,
        double avgRating,
        int reviewCount) {

}
