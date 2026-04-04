package com.soldesk.moa.place.dto;

import java.util.List;

public record MyLikedPlaceDTO(
    Long placeId,
    String name,
    String city,
    String district,
    Integer capacity,
    Double avgRating,
    Integer reviewCount,
    Integer pricePerHour,
    String thumbnailUrl,
    List<String> tags
) {}
