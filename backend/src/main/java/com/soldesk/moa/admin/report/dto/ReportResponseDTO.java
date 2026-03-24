package com.soldesk.moa.admin.report.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.admin.report.entity.constant.ReportCategory;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;

import lombok.Builder;

@Builder
public record ReportResponseDTO(
                long reportId,
                String reporterName,
                ReportTargetType targetType,
                long targetId,
                ReportCategory category,
                String description,
                ReportStatus status,
                String adminNote,
                LocalDateTime createdAt,
                ReportTargetContentDTO targetContent) {

}
