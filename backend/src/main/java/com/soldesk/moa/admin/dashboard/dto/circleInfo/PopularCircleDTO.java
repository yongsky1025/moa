package com.soldesk.moa.admin.dashboard.dto.circleInfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PopularCircleDTO {
    private Long circleId;
    private String circleName;
    private Integer currentMember;
    private String categoryName;
    private Double score;
}
