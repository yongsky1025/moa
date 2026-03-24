package com.soldesk.moa.admin.dashboard.dto.circleInfo;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record AdminCircleMemberDTO(
    Long userId,
    String userName,
    String gender,
    String role,
    String status,
    LocalDateTime joinDate
) {}
