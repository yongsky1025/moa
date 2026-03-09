package com.soldesk.moa.admin.dto;

import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.common.dto.PageRequestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminCircleSearchDTO extends PageRequestDTO {
    private CircleStatus status;
    private String CategoryName;
}
