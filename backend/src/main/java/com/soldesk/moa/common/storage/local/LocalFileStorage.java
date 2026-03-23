package com.soldesk.moa.common.storage.local;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

@Component
@Profile({ "local", "dev" })
public class LocalFileStorage implements FileStorage {

    private static final String HTTP_METHOD = "POST";
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "svg");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml");

    private final String localUploadDir;
    private final String localBaseUrl;

    public LocalFileStorage(
            @Value("${app.local-upload-dir}") String localUploadDir,
            @Value("${app.local-base-url}") String localBaseUrl) {
        this.localUploadDir = localUploadDir;
        this.localBaseUrl = localBaseUrl;
    }

    @Override
    public CreateUploadUrlResponseDTO createUploadUrl(String domain, String fileName, String contentType) {
        validateFile(fileName, contentType);
        String key = StorageKeyGenerator.generate(domain, fileName);

        String uploadUrl = "/api/local-files/upload?key=" + key;
        String fileUrl = normalizeBaseUrl(localBaseUrl) + "/uploads/" + key;

        return CreateUploadUrlResponseDTO.builder()
                .uploadUrl(uploadUrl)
                .fileUrl(fileUrl)
                .key(key)
                .method(HTTP_METHOD)
                .build();
    }

    @Override
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

    private void validateFile(String fileName, String contentType) {
        String extension = extractExtension(fileName).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않은 파일 확장자입니다.");
        }

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("허용되지 않은 contentType입니다.");
        }
    }

    private String extractExtension(String fileName) {
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

    private String sanitizeKey(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("..", "").replace("\\", "/");
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8080";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
