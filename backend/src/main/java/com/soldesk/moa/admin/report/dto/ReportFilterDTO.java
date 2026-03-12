package com.soldesk.moa.admin.report.dto;

import com.soldesk.moa.admin.report.entity.constant.ReportCategory;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.common.dto.PageRequestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilterDTO extends PageRequestDTO {
    private ReportStatus status; // 신고 상태
    private ReportTargetType targetType; // 신고 대상 유형
    private ReportCategory category; // 신고 유형
}
