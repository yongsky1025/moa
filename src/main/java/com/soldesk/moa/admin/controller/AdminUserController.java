package com.soldesk.moa.admin.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dto.UserInfoDTO;
import com.soldesk.moa.admin.service.AdminService;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@Tag(name = "Admin user section", description = "Response MOA API")
@RequiredArgsConstructor
@RequestMapping("/admin/user")
@Log4j2
public class AdminUserController {

    private final AdminService adminService;

    @GetMapping("/list")
    @Operation(summary = "admin user list data")
    public PageResultDTO<UserInfoDTO> getMethodName(PageRequestDTO pageRequestDTO) {
        log.info("전체 유저 리스트 요청");

        return adminService.getAllUserInfo(pageRequestDTO);
    }

    @GetMapping("/profile/{id}")
    @Operation(summary = "admin user profile data")
    public UserInfoDTO getMethodName(@PathVariable Long id) {
        log.info("user_id : {}의 정보조회", id);

        return adminService.getUserProfile(id);
    }

}
