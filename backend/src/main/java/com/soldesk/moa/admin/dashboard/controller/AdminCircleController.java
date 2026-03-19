package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleDetailDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleMemberDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCirclePostDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.PopularCircleDTO;
import com.soldesk.moa.admin.dashboard.service.AdminService;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.service.CircleService;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/circles")
@Tag(name = "Admin circle section", description = "Response MOA API")
@Log4j2
public class AdminCircleController {

    private final AdminService adminService;
    private final CircleService circleService;
    private final CircleCategoryRepository circleCategoryRepository;

    @GetMapping("/categories")
    @Operation(summary = "admin circle category name list")
    public List<String> getCategories() {
        return circleCategoryRepository.findAll().stream()
                .map(CircleCategory::getCategoryName)
                .toList();
    }

    @GetMapping("/list")
    @Operation(summary = "admin circle list data")
    public PageResultDTO<AdminCircleResponseDTO> getCircleList(AdminCircleSearchDTO searchDTO) {
        log.info("서클 리스트 요청");

        return adminService.getAllCircleInfo(searchDTO);
    }

    @GetMapping("/popular-circles")
    @Operation(summary = "admin circle top5 data")
    public ResponseEntity<List<PopularCircleDTO>> getPopularCircels() {
        log.info("인기모임 list 요청");
        List<PopularCircleDTO> result = adminService.findPopularCircles();

        return ResponseEntity.ok(result);
    }

    // 모임 상세 조회
    @GetMapping("/{circleId}")
    @Operation(summary = "admin circle detail data")
    public ResponseEntity<AdminCircleDetailDTO> getCircleDetail(@PathVariable Long circleId) {
        log.info("모임 상세 조회 요청: {}", circleId);
        return ResponseEntity.ok(adminService.getCircleDetail(circleId));
    }

    // 모임 가입 회원 목록
    @GetMapping("/{circleId}/members")
    @Operation(summary = "admin circle members data")
    public PageResultDTO<AdminCircleMemberDTO> getCircleMembers(
            @PathVariable Long circleId, PageRequestDTO pageRequestDTO) {
        log.info("모임 회원 목록 요청: {}", circleId);
        return adminService.getCircleMembers(circleId, pageRequestDTO);
    }

    // 모임 최근 게시물
    @GetMapping("/{circleId}/posts")
    @Operation(summary = "admin circle posts data")
    public PageResultDTO<AdminCirclePostDTO> getCirclePosts(
            @PathVariable Long circleId, PageRequestDTO pageRequestDTO) {
        log.info("모임 게시물 목록 요청: {}", circleId);
        return adminService.getCirclePosts(circleId, pageRequestDTO);
    }

    // 보류 중인 서클 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<List<CircleResponseDTO>> getPendingCircles() {
        return ResponseEntity.ok(circleService.getPendingCircles());
    }

    // 서클 승인
    @PatchMapping("/{circleId}/approve")
    public ResponseEntity<CircleResponseDTO> approveCircle(
            @PathVariable Long circleId) {
        return ResponseEntity.ok(circleService.approveCircle(circleId));
    }

    // 서클 거절
    @PatchMapping("/{circleId}/reject")
    public ResponseEntity<Void> rejectCircle(
            @PathVariable Long circleId) {
        circleService.rejectCircle(circleId);
        return ResponseEntity.noContent().build();
    }

    // 서클 강제 해산
    @PatchMapping("/{circleId}/close")
    public ResponseEntity<Void> deleteCircle(
            @PathVariable Long circleId) {
        circleService.adminDeleteCircle(circleId);
        return ResponseEntity.noContent().build();
    }

}
