package com.soldesk.moa.common.storage.service;

import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@Profile({ "local", "prod" })
@RequiredArgsConstructor
public class ImageUploadService {

    private final FileStorage fileStorage;
    private final UsersRepository usersRepository;
    private final ImageRepository imageRepository;

    public CreateUploadUrlResponseDTO createUploadUrl(CreateUploadUrlRequestDTO request, Long userId) {
        validateRequest(request);
        CreateUploadUrlResponseDTO upload = fileStorage.createUploadUrl(request.getDomain(), request.getFileName(),
                request.getContentType());

        if (!usersRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        imageRepository.save(Image.builder()
                .name(request.getFileName())
                .uuid(upload.getKey())
                .path(normalizeToUploadPath(upload.getFileUrl()))
                .domain(normalizeDomain(request.getDomain()))
                .uploadedByUserId(userId)
                .ord(0L)
                .status(ImageStatus.TEMP)
                .build());

        return upload;
    }

    public void delete(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        fileStorage.delete(key);
    }

    private void validateRequest(CreateUploadUrlRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("요청이 비어 있습니다.");
        }
        if (request.getFileName() == null || request.getFileName().isBlank()) {
            throw new IllegalArgumentException("fileName은 필수입니다.");
        }
        if (request.getContentType() == null || request.getContentType().isBlank()) {
            throw new IllegalArgumentException("contentType은 필수입니다.");
        }
    }

    private String normalizeToUploadPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }
        int idx = fileUrl.indexOf("/uploads/");
        if (idx >= 0) {
            return fileUrl.substring(idx);
        }
        return fileUrl;
    }

    private ImageDomain normalizeDomain(String domain) {
        return ImageDomain.from(domain);
    }
}

