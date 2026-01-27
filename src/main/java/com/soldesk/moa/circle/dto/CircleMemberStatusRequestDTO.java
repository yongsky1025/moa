package com.soldesk.moa.circle.dto;

import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;

import lombok.Getter;

@Getter
public class CircleMemberStatusRequestDTO {
    private CircleMemberStatus status;
}