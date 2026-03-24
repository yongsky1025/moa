package com.soldesk.moa.admin.dashboard.dto.postInfo;

import lombok.Builder;

@Builder
public record AdminNoticeRequestDTO(
    String title,
    String content
) {}
