package com.soldesk.moa.place.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;

@Builder
public record PlaceReviewDetailDTO(
        long id,
        int rating,
        String comment,
        String reviewerNickname,
        LocalDateTime createdAt,
        List<String> images) {
}
