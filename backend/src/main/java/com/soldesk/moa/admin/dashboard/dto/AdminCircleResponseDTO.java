package com.soldesk.moa.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class AdminCircleResponseDTO {
    private Long circleId;
    private String circleName;
    private String categoryName;
    private String leaderName;
    private Integer currentMember;
    private Integer maxMember;
    private String status;
}
