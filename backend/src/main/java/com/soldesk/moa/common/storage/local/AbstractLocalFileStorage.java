package com.soldesk.moa.common.storage.local;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

public abstract class AbstractLocalFileStorage {

    private static final String HTTP_METHOD = "POST";

    protected final String localUploadDir;
    protected final String localBaseUrl;

    protected AbstractLocalFileStorage(String localUploadDir, String localBaseUrl) {
        this.localUploadDir = localUploadDir;
        this.localBaseUrl = localBaseUrl;
    }

    public CreateUploadUrlResponseDTO createUploadUrl(String domain, String fileName, String contentType) {
        validateFile(fileName, contentType);
        String key = StorageKeyGenerator.generate(resourceTypePrefix(), domain, fileName);

        String uploadUrl = "/api/local-files/upload?key=" + key;
        String fileUrl = normalizeBaseUrl(localBaseUrl) + "/uploads/" + key;

        return CreateUploadUrlResponseDTO.builder()
                .uploadUrl(uploadUrl)
                .fileUrl(fileUrl)
                .key(key)
                .method(HTTP_METHOD)
                .build();
    }

    public void delete(String key) {
        try {
            String safeKey = sanitizeKey(key);
            Path baseDir = Paths.get(localUploadDir).normalize();
            Path target = baseDir.resolve(safeKey).normalize();
            if (!target.startsWith(baseDir)) {
                return;
            }
            Files.deleteIfExists(target);
        } catch (Exception ignored) {
            // delete는 best-effort로 처리
        }
    }

    protected abstract void validateFile(String fileName, String contentType);

    protected abstract String resourceTypePrefix();

    protected String extractExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "";
        }
        String normalized = fileName.replace("\\", "/");
        int slashIndex = normalized.lastIndexOf('/');
        String plainName = slashIndex >= 0 ? normalized.substring(slashIndex + 1) : normalized;
        int dotIndex = plainName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == plainName.length() - 1) {
            return "";
        }
        return plainName.substring(dotIndex + 1);
    }

    protected String sanitizeKey(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("..", "").replace("\\", "/");
    }

    protected String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8080";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
