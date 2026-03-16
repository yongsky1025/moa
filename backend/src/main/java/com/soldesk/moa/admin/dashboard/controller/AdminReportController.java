package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.statistic.ActivityHeatmapDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeCategoryRetentionDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeGroupDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CircleSurvivalDTO;
import com.soldesk.moa.admin.dashboard.service.AdminStatisticsService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/report")
@Tag(name = "Admin report section", description = "Response MOA API")
@Log4j2
public class AdminReportController {
    private final AdminStatisticsService adminStatisticsService;

    @GetMapping("/age-distribution")
    public ResponseEntity<List<AgeGroupDTO>> getAgeGroup() {
        log.info("연령대별 가입자 수");
        return ResponseEntity.ok(adminStatisticsService.getAgeGroup());
    }

    @GetMapping("/age-circle-participation")
    public ResponseEntity<List<AgeGroupDTO>> getAgeRangeParticipation() {
        log.info("연령대별 모임 참여자 통계");
        return ResponseEntity.ok(adminStatisticsService.findAgeRangeParticipation());
    }

    @GetMapping("/circle-survival")
    public ResponseEntity<CircleSurvivalDTO> getCircleSurvival() {
        log.info("모임 생존률");
        return ResponseEntity.ok(adminStatisticsService.getCircleSurvival());
    }

    @GetMapping("/activity-heatmap")
    public ResponseEntity<List<ActivityHeatmapDTO>> getActivityHeatmap() {
        log.info("시간대별 활동량");
        return ResponseEntity.ok(adminStatisticsService.getActivityHeatmap());
    }

    @GetMapping("/age-category-retention")
    public ResponseEntity<List<AgeCategoryRetentionDTO>> getAgeCategoryRetention() {
        log.info("연령대 + 카테고리별 모임 유지율");
        return ResponseEntity.ok(adminStatisticsService.getAgeCategoryRetention());
    }

}
