package com.soldesk.moa.place.dto;

import java.time.LocalDateTime;

public record MyUsedPlaceDTO(
    Long reservationId,
    Long placeId,
    String placeName,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Integer totalPrice,
    String thumbnailUrl,
    String sourceType,   // DIRECT | SCHEDULE
    boolean hasReview
) {}
