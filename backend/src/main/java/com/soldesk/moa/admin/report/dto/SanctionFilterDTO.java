package com.soldesk.moa.admin.report.dto;

import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionType;
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
public class SanctionFilterDTO extends PageRequestDTO {
    private Boolean isActive; // 활성 제재만 볼지 (true=활성, false=해제, null=전체)
    private SanctionType sanctionType; // 제재 종류 (BAN_1D/BAN_3D 등)
    private ReportTargetType targetType; // 제재 대상 유형
}
