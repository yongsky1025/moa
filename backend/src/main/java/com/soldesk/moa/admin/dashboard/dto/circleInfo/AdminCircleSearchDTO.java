package com.soldesk.moa.admin.dashboard.dto.circleInfo;

import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.common.dto.PageRequestDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminCircleSearchDTO extends PageRequestDTO {
    private CircleStatus status;
    private String categoryName;

    // 정렬 (newest|oldest|name|member_desc|member_asc)
    private String sort;
}
