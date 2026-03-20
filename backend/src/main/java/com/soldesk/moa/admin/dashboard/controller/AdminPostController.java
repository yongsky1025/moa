package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminNoticeRequestDTO;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostDetailDTO;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostSearchDTO;
import com.soldesk.moa.admin.dashboard.service.AdminService;
import com.soldesk.moa.common.dto.PageResultDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/posts")
@Tag(name = "Admin post management", description = "게시글 관리 API")
@Log4j2
public class AdminPostController {

    private final AdminService adminService;

    // ===== 게시글 관리 =====

    @GetMapping("/list")
    @Operation(summary = "게시글 목록 조회 (필터/검색/정렬)")
    public ResponseEntity<PageResultDTO<AdminPostResponseDTO>> getAdminPosts(
            @ModelAttribute AdminPostSearchDTO searchDTO) {
        log.info("게시글 목록 조회 요청: {}", searchDTO);
        return ResponseEntity.ok(adminService.getAdminPosts(searchDTO));
    }

    @GetMapping("/{postId}")
    @Operation(summary = "게시글 상세 조회")
    public ResponseEntity<AdminPostDetailDTO> getPostDetail(@PathVariable Long postId) {
        log.info("게시글 상세 조회 postId={}", postId);
        return ResponseEntity.ok(adminService.getPostDetail(postId));
    }

    // ===== 공지사항 관리 =====

    @PostMapping("/notices")
    @Operation(summary = "공지사항 작성")
    public ResponseEntity<Long> createNotice(
            @RequestParam Long adminId,
            @RequestBody AdminNoticeRequestDTO dto) {
        log.info("공지사항 작성 adminId={}", adminId);
        Long postId = adminService.createNotice(adminId, dto.title(), dto.content());
        return ResponseEntity.ok(postId);
    }

    @PutMapping("/notices/{postId}")
    @Operation(summary = "공지사항 수정")
    public ResponseEntity<Void> updateNotice(
            @PathVariable Long postId,
            @RequestBody AdminNoticeRequestDTO dto) {
        log.info("공지사항 수정 postId={}", postId);
        adminService.updateNotice(postId, dto.title(), dto.content());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notices/{postId}")
    @Operation(summary = "공지사항 삭제 (soft delete)")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long postId) {
        log.info("공지사항 삭제 postId={}", postId);
        adminService.deleteNotice(postId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/notices/{postId}/restore")
    @Operation(summary = "공지사항 복원")
    public ResponseEntity<Void> restoreNotice(@PathVariable Long postId) {
        log.info("공지사항 복원 postId={}", postId);
        adminService.restoreNotice(postId);
        return ResponseEntity.ok().build();
    }
}
