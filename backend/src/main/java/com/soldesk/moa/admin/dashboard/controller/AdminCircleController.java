package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.PopularCircleDTO;
import com.soldesk.moa.admin.dashboard.service.AdminService;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/circles")
@Tag(name = "Admin circle section", description = "Response MOA API")
@Log4j2
public class AdminCircleController {

    private final AdminService adminService;

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

}
