package com.soldesk.moa.admin.dashboard.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.service.AdminImageService;
import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@Profile({ "local", "prod" })
@RequestMapping("/api/admin/images")
@Tag(name = "Admin Image Upload", description = "관리자 이미지 업로드")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminImageUploadController {

    private final AdminImageService adminImageService;

    @PostMapping("/upload-url")
    @Operation(summary = "관리자 이미지 업로드 URL 생성")
    public ResponseEntity<CreateUploadUrlResponseDTO> createUploadUrl(
            @Valid @RequestBody CreateUploadUrlRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        return ResponseEntity.ok(adminImageService.createAdminUploadUrl(request, authUserDTO.getUserId()));
    }
}

