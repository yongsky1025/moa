package com.soldesk.moa.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// admin 메인 페이지 dto
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMainDTO {

    // 사용자 요약 영역
    // 유저 수 관련 (전체, 성비, 가입수, 탈퇴수)
    private UserCountDTO userCountDTO;

    // 가입, 탈퇴자 현황
    private UserStatusDTO userStatusDTO;

    // 모임 관련 요약
    private CircleSummaryDTO circleSummaryDTO;

    private DashboardChartDTO dashboardChartDTO;

}
