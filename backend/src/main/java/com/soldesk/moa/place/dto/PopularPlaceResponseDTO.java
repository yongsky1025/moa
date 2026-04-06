package com.soldesk.moa.place.dto;

import java.util.List;

public record PopularPlaceResponseDTO(
        Long placeId,
        String name,
        String city,
        Double averageRating,
        String imageUrl,
        List<String> tags) {
}
