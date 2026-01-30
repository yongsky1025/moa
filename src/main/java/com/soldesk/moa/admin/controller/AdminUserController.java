package com.soldesk.moa.admin.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dto.AdminUserResponseDTO;
import com.soldesk.moa.admin.dto.AdminUserSearchDTO;
import com.soldesk.moa.admin.dto.UserInfoCircleDTO;
import com.soldesk.moa.admin.dto.UserInfoDTO;
import com.soldesk.moa.admin.dto.UserInfoPostDTO;
import com.soldesk.moa.admin.dto.UserInfoReplyDTO;
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
@RequestMapping("/admin/users")
@Log4j2
public class AdminUserController {

    private final AdminService adminService;

    @GetMapping("/list")
    @Operation(summary = "admin user list data")
    public PageResultDTO<AdminUserResponseDTO> getUserList(AdminUserSearchDTO searchDTO) {
        log.info("전체 유저 리스트 요청");

        return adminService.getAllUserInfo(searchDTO);
    }

    @GetMapping("/profile/{id}")
    @Operation(summary = "admin user profile data")
    public UserInfoDTO getUserProfile(@PathVariable Long id) {
        log.info("user_id : {}의 정보조회", id);

        return adminService.getUserProfile(id);
    }

    @GetMapping("/profile/{id}/post")
    @Operation(summary = "admin user post list")
    public PageResultDTO<UserInfoPostDTO> getUserPostList(@PathVariable Long id, PageRequestDTO pageRequestDTO) {
        log.info("user_id {}의 작성글 이력 조회 ", id);

        return adminService.searchBoardListByUserId(id, pageRequestDTO);
    }

    @GetMapping("/profile/{id}/reply")
    @Operation(summary = "admin user reply list")
    public PageResultDTO<UserInfoReplyDTO> getUserReplyList(@PathVariable Long id, PageRequestDTO pageRequestDTO) {
        log.info("user_id {}의 댓글 이력 조회 ", id);

        return adminService.getReplyByUserId(id, pageRequestDTO);
    }

    @GetMapping("/profile/{id}/circle")
    @Operation(summary = "admin user join circle list")
    public PageResultDTO<UserInfoCircleDTO> getUserCircleList(@PathVariable Long id, PageRequestDTO pageRequestDTO) {
        log.info("user_id {}의 가입 모임 조회 ", id);

        return adminService.getJoinCircleByUserId(id, pageRequestDTO);
    }

}
