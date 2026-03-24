package com.soldesk.moa.admin.report.dto;

import java.util.List;

import com.soldesk.moa.admin.report.entity.constant.ReportCategory;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;

import lombok.Builder;

@Builder
public record ReportRequestDTO(
        ReportTargetType targetType,
        Long targetId,
        ReportCategory category,
        String description,
        List<String> imagePaths) { // 증거 이미지 경로 (선택)

}
