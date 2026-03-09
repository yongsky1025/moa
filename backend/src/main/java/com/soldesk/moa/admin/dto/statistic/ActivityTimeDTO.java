package com.soldesk.moa.admin.dto.statistic;

import lombok.Builder;

@Builder
public record ActivityTimeDTO(
        int hour,
        long activityCount) {
}