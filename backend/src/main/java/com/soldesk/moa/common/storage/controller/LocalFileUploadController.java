package com.soldesk.moa.common.storage.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;

@RestController
@Profile({ "local", "prod" })
@RequestMapping("/api/local-files")
@Log4j2
public class LocalFileUploadController {

    private static final int THUMBNAIL_MAX_WIDTH = 720;
    private static final int THUMBNAIL_MAX_HEIGHT = 480;

    private final String localUploadDir;
    private final String localBaseUrl;

    public LocalFileUploadController(
            @Value("${upload.root}") String localUploadDir,
            @Value("${upload.base-url}") String localBaseUrl) {
        this.localUploadDir = localUploadDir;
        this.localBaseUrl = localBaseUrl;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("key") String key,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String safeKey = normalizeKey(key);
        validateSupportedPrefix(safeKey);
        Path baseDir = Paths.get(localUploadDir).normalize();
        Path targetPath = baseDir.resolve(safeKey).normalize();

        if (!targetPath.startsWith(baseDir)) {
            throw new IllegalArgumentException("유효하지 않은 key 경로입니다.");
        }

        Path parent = targetPath.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = normalizeBaseUrl(localBaseUrl) + "/uploads/" + safeKey;
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("key", safeKey);
        response.put("fileUrl", fileUrl);

        String thumbnailKey = toThumbnailKeyOrNull(safeKey);
        if (thumbnailKey != null && createThumbnail(baseDir, targetPath, thumbnailKey, file)) {
            response.put("thumbnailKey", thumbnailKey);
            response.put("thumbnailUrl", normalizeBaseUrl(localBaseUrl) + "/uploads/" + thumbnailKey);
        }
        return ResponseEntity.ok(response);
    }

    private void validateSupportedPrefix(String safeKey) {
        if (safeKey.startsWith("images/") || safeKey.startsWith("files/")) {
            return;
        }
        throw new IllegalArgumentException("지원하지 않는 key prefix입니다.");
    }

    private String normalizeKey(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("key는 필수입니다.");
        }

        String normalized = key.replace("\\", "/");
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.contains("..")) {
            throw new IllegalArgumentException("유효하지 않은 key입니다.");
        }

        String[] parts = normalized.split("/");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            if (!part.matches("[a-zA-Z0-9._-]+")) {
                throw new IllegalArgumentException("유효하지 않은 key 형식입니다.");
            }
            if (builder.length() > 0) {
                builder.append("/");
            }
            builder.append(part);
        }

        if (builder.length() == 0) {
            throw new IllegalArgumentException("유효하지 않은 key입니다.");
        }

        return builder.toString();
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("upload.base-url 설정이 필요합니다.");
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String toThumbnailKeyOrNull(String key) {
        if (key == null || key.isBlank() || !key.startsWith("images/")) {
            return null;
        }
        int lastSlashIdx = key.lastIndexOf('/');
        if (lastSlashIdx < 0 || lastSlashIdx == key.length() - 1) {
            return null;
        }

        String directory = key.substring(0, lastSlashIdx);
        String fileName = key.substring(lastSlashIdx + 1);
        int dotIdx = fileName.lastIndexOf('.');
        String baseName = dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName;

        return directory + "/thumbnails/" + baseName + "_thm.webp";
    }

    private boolean createThumbnail(Path baseDir, Path sourcePath, String thumbnailKey, MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && contentType.equalsIgnoreCase("image/svg+xml")) {
            return false;
        }

        Path thumbnailPath = baseDir.resolve(thumbnailKey).normalize();
        if (!thumbnailPath.startsWith(baseDir)) {
            throw new IllegalArgumentException("유효하지 않은 thumbnail key 경로입니다.");
        }

        try {
            Path parent = thumbnailPath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            try (InputStream input = Files.newInputStream(sourcePath)) {
                Thumbnails.of(input)
                        .size(THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT)
                        .outputFormat("webp")
                        .toFile(thumbnailPath.toFile());
            }
            return true;
        } catch (Exception e) {
            log.warn("[UPLOAD] thumbnail generation failed. source={}, thumbnailKey={}, reason={}",
                    sourcePath, thumbnailKey, e.getMessage());
            return false;
        }
    }
}

