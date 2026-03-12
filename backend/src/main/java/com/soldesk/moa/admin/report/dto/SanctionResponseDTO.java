package com.soldesk.moa.admin.report.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionType;

import lombok.Builder;

@Builder
public record SanctionResponseDTO(
                Long sanctionId,
                String targetUserName,
                String adminName,
                ReportTargetType targetType,
                Long targetId,
                SanctionType sanctionType,
                boolean isActive,
                String reason,
                LocalDateTime startAt,
                LocalDateTime endAt // null = 영구정지
) {

}
