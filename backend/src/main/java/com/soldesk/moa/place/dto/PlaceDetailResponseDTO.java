package com.soldesk.moa.place.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record PlaceDetailResponseDTO(
        long id,
        String name,
        String address,
        String city,
        String district,
        String dong,
        double latitude,
        double longitude,
        int capacity,
        int pricePerHour,
        double avgRating,
        int reviewCount,
        String representativeImagePath,
        String description,
        int minReservationMinutes,
        int maxReservationMinutes,
        String openTime,
        String closeTime,
        List<TagResponseDTO> tags,
        List<PlaceClosedDayDTO> closedDays,
        List<String> images,
        long likeCount) {
}
