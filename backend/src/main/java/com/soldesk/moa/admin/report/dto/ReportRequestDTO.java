package com.soldesk.moa.admin.report.dto;

import com.soldesk.moa.admin.report.entity.constant.ReportCategory;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;

import lombok.Builder;

@Builder
public record ReportRequestDTO(
                ReportTargetType targetType,
                Long targetId,
                ReportCategory category,
                String description) {

}
