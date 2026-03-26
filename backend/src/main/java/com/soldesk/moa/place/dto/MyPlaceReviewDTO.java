package com.soldesk.moa.place.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;

@Builder
public record MyPlaceReviewDTO(
        long reviewId,
        long placeId,
        String placeName,
        LocalDateTime reservationStartTime,
        int rating,
        String comment,
        LocalDateTime createdAt,
        List<String> images) {
}
