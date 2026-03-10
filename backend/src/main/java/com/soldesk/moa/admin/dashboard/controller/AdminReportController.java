package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.statistic.AgeGroupDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CircleSurvivalDTO;
import com.soldesk.moa.admin.dashboard.service.AdminStatisticsService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/report")
@Tag(name = "Admin report section", description = "Response MOA API")
@Log4j2
public class AdminReportController {
    private final AdminStatisticsService adminStatisticsService;

    @GetMapping("/age-distribution")
    public List<AgeGroupDTO> getAgeGroup() {
        log.info("연령대별 가입자 수");
        return adminStatisticsService.getAgeGroup();
    }

    @GetMapping("/age-circle-participation")
    public List<AgeGroupDTO> getAgeRangeParticipation() {
        log.info("연령대별 모임 참여자 통계");
        return adminStatisticsService.findAgeRangeParticipation();
    }

    @GetMapping("/circle-survival")
    public CircleSurvivalDTO getCircleSurvival() {
        log.info("모임 생존률");
        return adminStatisticsService.getCircleSurvival();
    }

}
