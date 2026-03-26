package com.soldesk.moa.admin.dashboard.dto.circleInfo;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record AdminCirclePostDTO(
    Long postId,
    String title,
    String authorName,
    Integer viewCount,
    Integer replyCount,
    LocalDateTime createDate
) {}
