package com.soldesk.moa.common.storage.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;
import com.soldesk.moa.common.storage.service.FileUploadService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController("commonStorageFileUploadController")
@Profile({ "local", "prod" })
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/upload-url")
    public ResponseEntity<CreateUploadUrlResponseDTO> createUploadUrl(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody CreateUploadUrlRequestDTO request) {
        return ResponseEntity.ok(fileUploadService.createUploadUrl(request, authUser.getUserId()));
    }
}

