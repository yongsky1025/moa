package com.soldesk.moa.place.dto;

import com.soldesk.moa.common.entity.constant.LikeTargetType;

import lombok.Builder;

@Builder
public record PlaceLikiResponseDTO(
        LikeTargetType targetType,
        Long targetId,
        boolean liked, // 좋아요 누름?
        Long likeCount) {

}
