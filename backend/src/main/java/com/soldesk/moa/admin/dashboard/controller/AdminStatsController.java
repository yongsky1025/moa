package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.statistic.ActivityHeatmapDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AdminPlaceStatisticDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeCategoryRetentionDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeGroupDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CircleSurvivalDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.DistrictDistDTO;
import com.soldesk.moa.admin.dashboard.service.AdminStatisticsService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/stats")
@Tag(name = "Admin stats section", description = "Response MOA API")
@Log4j2
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {
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

    // ──────────────────────────────────────────────
    // 장소 통계 리포트
    // ──────────────────────────────────────────────

    /** 장소 통계 리포트 전체 (연계율 + 지역분포 + 카테고리별 사용률) */
    @GetMapping("/place-stats")
    public ResponseEntity<AdminPlaceStatisticDTO> getAdminPlaceStatistic() {
        log.info("장소 통계 리포트");
        return ResponseEntity.ok(adminStatisticsService.getAdminPlaceStatistic());
    }

    /** 구/군 드릴다운 (시/도 클릭 시 호출) */
    @GetMapping("/place/region")
    public ResponseEntity<List<DistrictDistDTO>> getDistrictDistribution(
            @RequestParam String city) {
        log.info("지역 드릴다운 city={}", city);
        return ResponseEntity.ok(adminStatisticsService.getDistrictDistribution(city));
    }

}
