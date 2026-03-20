package com.soldesk.moa.admin.report.dto;

import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionType;

import lombok.Builder;

@Builder
public record SanctionRequestDTO(
        Long reportId, // 관리자 직접제재 && 자동 제재 시 null
        Long targetUserId,
        ReportTargetType targetType,
        Long targetId,
        SanctionType sanctionType,
        String reason) {

}
