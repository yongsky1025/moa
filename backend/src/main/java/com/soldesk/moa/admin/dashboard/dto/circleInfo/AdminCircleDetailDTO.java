package com.soldesk.moa.admin.dashboard.dto.circleInfo;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record AdminCircleDetailDTO(
    Long circleId,
    String circleName,
    String description,
    String categoryName,
    String leaderName,
    Long leaderId,
    Integer currentMember,
    Integer maxMember,
    String status,
    String coverImageUrl,
    LocalDateTime createDate,
    Integer totalPosts
) {}
