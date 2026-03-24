package com.soldesk.moa.admin.dashboard.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.admin.dashboard.service.AdminImageService;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@Profile({ "local", "dev" })
@RequestMapping("/api/admin/images")
@Tag(name = "Admin Image Upload", description = "관리자 이미지 업로드 (개발용, 인증 불필요)")
@RequiredArgsConstructor
public class AdminImageUploadController {

    private final AdminImageService adminImageService;

    @PostMapping("/upload-url")
    @Operation(summary = "관리자 이미지 업로드 URL 생성")
    public ResponseEntity<CreateUploadUrlResponseDTO> createUploadUrl(
            @Valid @RequestBody CreateUploadUrlRequestDTO request) {
        return ResponseEntity.ok(adminImageService.createAdminUploadUrl(request));
    }

    @PostMapping("/upload")
    @Operation(summary = "관리자 이미지 파일 저장")
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam String key,
            @RequestParam MultipartFile file) throws IOException {
        return ResponseEntity.ok(adminImageService.saveAdminFile(key, file));
    }
}
