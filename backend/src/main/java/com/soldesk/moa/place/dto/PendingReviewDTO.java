package com.soldesk.moa.place.dto;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record PendingReviewDTO(
        long reservationId,
        long placeId,
        String placeName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        LocalDateTime reviewDeadline) {
}
