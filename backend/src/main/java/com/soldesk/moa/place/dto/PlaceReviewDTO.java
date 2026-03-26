package com.soldesk.moa.place.dto;

import lombok.Builder;

@Builder
public record PlaceReviewDTO(
        long id,
        int rating,
        String comment,
        String reviewerNickname) {
}
