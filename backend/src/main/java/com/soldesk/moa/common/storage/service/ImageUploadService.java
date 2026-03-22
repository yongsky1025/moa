package com.soldesk.moa.common.storage.service;

import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@Profile({ "local", "dev" })
@RequiredArgsConstructor
public class ImageUploadService {

    private final FileStorage fileStorage;

    public CreateUploadUrlResponseDTO createUploadUrl(CreateUploadUrlRequestDTO request) {
        validateRequest(request);
        return fileStorage.createUploadUrl(request.getDomain(), request.getFileName(), request.getContentType());
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
}
