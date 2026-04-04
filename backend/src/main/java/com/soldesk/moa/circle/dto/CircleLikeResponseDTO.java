package com.soldesk.moa.circle.dto;

import lombok.Builder;

@Builder
public record CircleLikeResponseDTO(
        Long circleId,
        boolean liked,
        long likeCount) {
}
