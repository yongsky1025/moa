package com.soldesk.moa.admin.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardChartDTO {

    // 월별 가입자 수
    private List<MonthlyCountDTO> signUpChart;

    // 월별 탈퇴자 수
    private List<MonthlyCountDTO> withdrawnChart;
}
