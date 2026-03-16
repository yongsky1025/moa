package com.soldesk.moa.admin.dashboard.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record PostActivitySummaryDTO(
        Long todayPostCount,
        Long todayReplyCount,
        List<DailyCountDTO> weeklyPosts,
        List<DailyCountDTO> weeklyReplis) {

}
