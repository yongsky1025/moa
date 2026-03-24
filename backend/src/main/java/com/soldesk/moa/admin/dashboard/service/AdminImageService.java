package com.soldesk.moa.admin.dashboard.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlRequestDTO;
import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

import lombok.extern.log4j.Log4j2;

/**
 * 관리자 이미지 업로드 서비스 (로컬 개발 전용)
 * 업로드 URL을 /api/admin/images/upload 로 오버라이드하여 인증 없이 사용 가능하게 한다.
 */
@Service
@Profile({ "local", "dev" })
@Log4j2
public class AdminImageService {

    /** 인증 없이 업로드 시 사용하는 시스템 uploader ID */
    public static final Long ADMIN_UPLOADER_ID = 0L;

    private final FileStorage fileStorage;
    private final ImageRepository imageRepository;
    private final String localUploadDir;
    private final String localBaseUrl;

    public AdminImageService(
            FileStorage fileStorage,
            ImageRepository imageRepository,
            @Value("${app.local-upload-dir}") String localUploadDir,
            @Value("${app.local-base-url}") String localBaseUrl) {
        this.fileStorage = fileStorage;
        this.imageRepository = imageRepository;
        this.localUploadDir = localUploadDir;
        this.localBaseUrl = localBaseUrl;
    }

    /**
     * 업로드 URL 생성 + TEMP 이미지 레코드 저장
     */
    @Transactional
    public CreateUploadUrlResponseDTO createAdminUploadUrl(CreateUploadUrlRequestDTO request) {
        CreateUploadUrlResponseDTO storageResult = fileStorage.createUploadUrl(
                request.getDomain(), request.getFileName(), request.getContentType());

        CreateUploadUrlResponseDTO response = CreateUploadUrlResponseDTO.builder()
                .uploadUrl("/api/admin/images/upload?key=" + storageResult.getKey())
                .fileUrl(storageResult.getFileUrl())
                .key(storageResult.getKey())
                .method("POST")
                .build();

        imageRepository.save(Image.builder()
                .name(request.getFileName())
                .uuid(storageResult.getKey())
                .path(normalizeToUploadPath(storageResult.getFileUrl()))
                .domain(ImageDomain.from(request.getDomain()))
                .uploadedByUserId(ADMIN_UPLOADER_ID)
                .ord(0L)
                .status(ImageStatus.TEMP)
                .build());

        return response;
    }

    /** 실제 파일을 로컬 디렉터리에 저장 */
    public Map<String, String> saveAdminFile(String key, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String safeKey = normalizeKey(key);
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
        return Map.of("status", "success", "key", safeKey, "fileUrl", fileUrl);
    }

    private String normalizeToUploadPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        int idx = fileUrl.indexOf("/uploads/");
        return idx >= 0 ? fileUrl.substring(idx) : fileUrl;
    }

    private String normalizeKey(String key) {
        if (key == null || key.isBlank()) throw new IllegalArgumentException("key는 필수입니다.");
        String normalized = key.replace("\\", "/");
        while (normalized.startsWith("/")) normalized = normalized.substring(1);
        if (normalized.contains("..")) throw new IllegalArgumentException("유효하지 않은 key입니다.");

        String[] parts = normalized.split("/");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) continue;
            if (!part.matches("[a-zA-Z0-9._-]+")) throw new IllegalArgumentException("유효하지 않은 key 형식입니다.");
            if (sb.length() > 0) sb.append("/");
            sb.append(part);
        }
        if (sb.length() == 0) throw new IllegalArgumentException("유효하지 않은 key입니다.");
        return sb.toString();
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) return "http://localhost:8080";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
