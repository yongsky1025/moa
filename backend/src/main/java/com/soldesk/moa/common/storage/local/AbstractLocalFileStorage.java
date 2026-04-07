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
        String thumbnailKey = toThumbnailKeyOrNull(key);
        String thumbnailUrl = thumbnailKey == null ? null : normalizeBaseUrl(localBaseUrl) + "/uploads/" + thumbnailKey;

        return CreateUploadUrlResponseDTO.builder()
                .uploadUrl(uploadUrl)
                .fileUrl(fileUrl)
                .key(key)
                .thumbnailUrl(thumbnailUrl)
                .thumbnailKey(thumbnailKey)
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

            String thumbnailKey = toThumbnailKeyOrNull(safeKey);
            if (thumbnailKey != null) {
                Path thumbnailTarget = baseDir.resolve(thumbnailKey).normalize();
                if (thumbnailTarget.startsWith(baseDir)) {
                    Files.deleteIfExists(thumbnailTarget);
                }
            }
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
            throw new IllegalStateException("upload.base-url 설정이 필요합니다.");
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    protected String toThumbnailKeyOrNull(String key) {
        if (key == null || key.isBlank() || !key.startsWith("images/")) {
            return null;
        }
        int dotIdx = key.lastIndexOf('.');
        String base = dotIdx > 0 ? key.substring(0, dotIdx) : key;
        return base + "_thm.webp";
    }
}
