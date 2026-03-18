package com.soldesk.moa.admin.report.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionState;
import com.soldesk.moa.admin.report.entity.constant.SanctionType;

import lombok.Builder;

@Builder
public record SanctionResponseDTO(
                Long reportId,
                Long sanctionId,
                String targetUserName,
                String adminName,
                ReportTargetType targetType,
                Long targetId,
                SanctionType sanctionType,
                SanctionState sanctionState,
                String reason,
                LocalDateTime startAt,
                LocalDateTime endAt, // null = 영구정지

                // 취소 관련...(cancelled일때만 값존재)
                String cancelledByName,
                String cancelReason,
                LocalDateTime cancelledAt) {

}
