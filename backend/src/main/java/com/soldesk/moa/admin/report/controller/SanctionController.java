package com.soldesk.moa.admin.report.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.report.dto.SanctionFilterDTO;
import com.soldesk.moa.admin.report.dto.SanctionRequestDTO;
import com.soldesk.moa.admin.report.dto.SanctionResponseDTO;
import com.soldesk.moa.admin.report.service.SanctionService;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/sanctions")
@Tag(name = "Admin sanction section", description = "Response MOA API")
@Log4j2
public class SanctionController {

    private final SanctionService sanctionService;

    @GetMapping("/list")
    @Operation(summary = "제재 리스트")
    public ResponseEntity<PageResultDTO<SanctionResponseDTO>> getSanctions(@ModelAttribute SanctionFilterDTO filter) {
        log.info("제재 리스트 요청");
        return ResponseEntity.ok(sanctionService.getSanctions(filter));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "특정 유저 제재 목록")
    public ResponseEntity<List<SanctionResponseDTO>> getUserSanctionHistory(@PathVariable Long userId) {
        log.info("id={} 유저의 제재 목록 확인", userId);
        return ResponseEntity.ok(sanctionService.getUserSanctionHistory(userId));
    }

    @PostMapping
    @Operation(summary = "제재 승인")
    public ResponseEntity<Void> applySanction(@RequestParam Long adminId, @RequestBody SanctionRequestDTO dto) {
        log.info("제재 승인 admin id {}", adminId);
        sanctionService.applySanction(adminId, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{sanctionId}")
    @Operation(summary = "제재 해제")
    public ResponseEntity<Void> liftSanction(@PathVariable Long sanctionId) {
        log.info("제재 해제 sanction id {}", sanctionId);
        sanctionService.liftSanction(sanctionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{sanctionId}/cancel")
    @Operation(summary = "제재 취소")
    public ResponseEntity<Void> cancelSanction(
            @PathVariable Long sanctionId,
            @RequestParam Long adminId,
            @RequestParam String cancelReason) {
        log.info("제재 취소 요청 adminId={} sanctionId={}", adminId, sanctionId);
        sanctionService.cancelSanction(sanctionId, adminId, cancelReason);
        return ResponseEntity.ok().build();
    }

}
