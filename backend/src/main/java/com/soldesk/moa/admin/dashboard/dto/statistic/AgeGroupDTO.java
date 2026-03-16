package com.soldesk.moa.admin.dashboard.dto.statistic;

import lombok.Builder;

@Builder
public record AgeGroupDTO(
        String ageGroup,
        long userCount,
        long countMale,
        long countFemale,
        long countOther) {

}
