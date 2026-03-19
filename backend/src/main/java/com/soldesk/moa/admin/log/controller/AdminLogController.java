package com.soldesk.moa.admin.log.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.log.entity.AdminActionLog;
import com.soldesk.moa.admin.log.service.AdminLogService;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/admin/logs")
@Tag(name = "Admin log section", description = "Response MOA API")
@RequiredArgsConstructor
@Log4j2
public class AdminLogController {
    private final AdminLogService adminLogService;

    @GetMapping("/list")
    @Operation(summary = "admin log list data")
    public PageResultDTO<AdminActionLog> getAllLogs(PageRequestDTO pageRequestDTO) {
        log.info("전체 로그 요청");

        return adminLogService.getLogs(pageRequestDTO);
    }

    @GetMapping("/users/{id}/logs")
    @Operation(summary = "admin log list data by user id")
    public PageResultDTO<AdminActionLog> getUserLogs(@PathVariable Long id, PageRequestDTO pageRequestDTO) {
        log.info("사용자 로그 요청: {}", id);

        return adminLogService.getLogsByActorId(id, pageRequestDTO);
    }

}
