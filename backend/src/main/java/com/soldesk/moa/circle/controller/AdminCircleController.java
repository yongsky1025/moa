package com.soldesk.moa.circle.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.service.CircleService;

import lombok.RequiredArgsConstructor;

@RestController("circleAdminController")
@RequestMapping("/admin/circles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCircleController {

    private final CircleService circleService;

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
}
