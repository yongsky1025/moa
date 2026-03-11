package com.soldesk.moa.admin.dashboard.dto.statistic;

import lombok.Builder;

@Builder
public record AgeCategoryRetentionDTO(
        String ageGroup,
        String categoryName,
        long totalMembers,
        long retainedMembers,
        double rate) {

}
