package com.soldesk.moa.admin.dashboard.dto.statistic;

import lombok.Builder;

@Builder
public record ActivityTimeDTO(
                int hour,
                long activityCount) {
}