package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.maindashboard.AdminMainDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.PostActivitySummaryDTO;
import com.soldesk.moa.admin.dashboard.service.AdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@Tag(name = "Admin main section", description = "Response MOA API")
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@Log4j2
@PreAuthorize("hasRole('ADMIN')")
public class AdminMainController {

    private final AdminService adminService;

    @GetMapping("/main")
    @Operation(summary = "admin main data", description = "메인페이지 data")
    public AdminMainDTO getAdminMain() {
        log.info("admin main page");
        return adminService.mainDashBoard();
    }

    @GetMapping("/post-activity")
    @Operation(summary = "admin main data - post", description = "게시글 활동 data")
    public ResponseEntity<PostActivitySummaryDTO> getMethodName() {
        log.info("admin main page - 게시글 활동");
        return ResponseEntity.ok(adminService.postActivitySummary());
    }

}
