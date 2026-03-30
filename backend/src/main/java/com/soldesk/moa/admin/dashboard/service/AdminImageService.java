package com.soldesk.moa.admin.dashboard.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 이미지 업로드 서비스 (로컬 개발 전용)
 */
@Service
@Profile({ "local", "dev" })
@RequiredArgsConstructor
public class AdminImageService {

    private final FileStorage fileStorage;
    private final ImageRepository imageRepository;

    /**
     * 업로드 URL 생성 + TEMP 이미지 레코드 저장
     */
    @Transactional
    public CreateUploadUrlResponseDTO createAdminUploadUrl(CreateUploadUrlRequestDTO request, Long uploaderId) {
        CreateUploadUrlResponseDTO result = fileStorage.createUploadUrl(
                request.getDomain(), request.getFileName(), request.getContentType());

        imageRepository.save(Image.builder()
                .name(request.getFileName())
                .uuid(result.getKey())
                .path(normalizeToUploadPath(result.getFileUrl()))
                .domain(ImageDomain.from(request.getDomain()))
                .uploadedByUserId(uploaderId)
                .ord(0L)
                .status(ImageStatus.TEMP)
                .build());

        return result;
    }

    private String normalizeToUploadPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        int idx = fileUrl.indexOf("/uploads/");
        return idx >= 0 ? fileUrl.substring(idx) : fileUrl;
    }
}
