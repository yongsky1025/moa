package com.soldesk.moa.admin.dashboard.dto.statistic;

import lombok.Builder;

@Builder
public record ActivityHeatmapDTO(
                int dayOfweek,
                int hour,
                long activityCount,
                long userRegisterCount,
                long circleCreateCount,
                long postCount,
                long replyCount,
                long scheduleCount) {
}
