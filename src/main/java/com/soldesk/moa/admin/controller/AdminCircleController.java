package com.soldesk.moa.admin.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dto.AdminCircleResponseDTO;
import com.soldesk.moa.admin.dto.AdminCircleSearchDTO;
import com.soldesk.moa.admin.service.AdminService;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

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

}
