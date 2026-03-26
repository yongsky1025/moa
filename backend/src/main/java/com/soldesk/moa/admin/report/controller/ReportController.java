package com.soldesk.moa.admin.report.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.report.dto.ReportFilterDTO;
import com.soldesk.moa.admin.report.dto.ReportRequestDTO;
import com.soldesk.moa.admin.report.dto.ReportResponseDTO;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.service.ReportService;
import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
@Tag(name = "Admin report section", description = "Response MOA API")
@Log4j2
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "신고 접수")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Void> postReport(
            @AuthenticationPrincipal AuthUserDTO authUserDTO,
            @RequestBody ReportRequestDTO dto) {
        // Security 적용 전 임시: 인증 없으면 1L (개발용 기본 유저)
        // Security 적용 후: authUserDTO.getUserId() 만 사용
        Long reporterId = authUserDTO.getUserId();
        log.info("신고 접수 요청 reporterId={}", reporterId);
        reportService.submitReport(reporterId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/list")
    @Operation(summary = "신고 리스트")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResultDTO<ReportResponseDTO>> getReports(@ModelAttribute ReportFilterDTO filterDTO) {
        log.info("신고 리스트 요청");
        return ResponseEntity.ok(reportService.getReports(filterDTO));
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "신고 상세 정보")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponseDTO> getOneReport(@PathVariable Long reportId) {
        log.info("신고 상세 정보 요청");
        return ResponseEntity.ok(reportService.getOneReport(reportId));
    }

    @PatchMapping("/{reportId}/status")
    @Operation(summary = "신고 상태 변경")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long reportId,
            @RequestParam ReportStatus status,
            @RequestParam String adminNote) {
        reportService.updateReportStatus(reportId, status, adminNote);
        return ResponseEntity.ok().build();
    }

}
