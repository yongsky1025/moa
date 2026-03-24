package com.soldesk.moa.common.storage.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

@RestController
@Profile({ "local", "dev" })
@RequestMapping("/api/local-files")
public class LocalFileUploadController {

    private final String localImageUploadDir;
    private final String localFileUploadDir;
    private final String localBaseUrl;

    public LocalFileUploadController(
            @Value("${app.local-image-upload-dir}") String localImageUploadDir,
            @Value("${app.local-file-upload-dir}") String localFileUploadDir,
            @Value("${app.local-base-url}") String localBaseUrl) {
        this.localImageUploadDir = localImageUploadDir;
        this.localFileUploadDir = localFileUploadDir;
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
        Path baseDir = resolveBaseDir(safeKey);
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
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "key", safeKey,
                "fileUrl", fileUrl));
    }

    private Path resolveBaseDir(String safeKey) {
        if (safeKey.startsWith("images/")) {
            return Paths.get(localImageUploadDir).normalize();
        }
        if (safeKey.startsWith("files/")) {
            return Paths.get(localFileUploadDir).normalize();
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
            return "http://localhost:8080";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
