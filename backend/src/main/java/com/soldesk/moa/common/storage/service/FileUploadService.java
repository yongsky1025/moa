package com.soldesk.moa.common.storage.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.soldesk.moa.common.entity.CommonFile;
import com.soldesk.moa.common.entity.constant.FileDomain;
import com.soldesk.moa.common.entity.constant.FileStatus;
import com.soldesk.moa.common.repository.CommonFileRepository;
import com.soldesk.moa.common.storage.GeneralFileStorage;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@Profile({ "local", "prod" })
@RequiredArgsConstructor
public class FileUploadService {

    private final GeneralFileStorage generalFileStorage;
    private final UsersRepository usersRepository;
    private final CommonFileRepository commonFileRepository;

    public CreateUploadUrlResponseDTO createUploadUrl(CreateUploadUrlRequestDTO request, Long userId) {
        validateRequest(request);
        CreateUploadUrlResponseDTO upload = generalFileStorage.createUploadUrl(
                request.getDomain(),
                request.getFileName(),
                request.getContentType());

        if (!usersRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        commonFileRepository.save(CommonFile.builder()
                .name(request.getFileName())
                .uuid(upload.getKey())
                .path(normalizeToUploadPath(upload.getFileUrl()))
                .contentType(request.getContentType())
                .domain(FileDomain.from(request.getDomain()))
                .uploadedByUserId(userId)
                .status(FileStatus.TEMP)
                .build());
        return upload;
    }

    public void delete(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        generalFileStorage.delete(key);
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
}

