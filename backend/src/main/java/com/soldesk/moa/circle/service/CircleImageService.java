package com.soldesk.moa.circle.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.URI;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.storage.local.StorageKeyGenerator;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CircleImageService {
    private static final ImageDomain CIRCLE_IMAGE_DOMAIN = ImageDomain.CIRCLE;

    @Value("${app.local-image-upload-dir}")
    private String localUploadDir;

    @Value("${app.local-base-url:http://localhost:8080}")
    private String localBaseUrl;

    private final ImageRepository imageRepository;
    private final UsersRepository usersRepository;

    /**
     * 서클 대표 이미지를 디스크에 저장하고 Image 엔티티를 반환
     * - post 없음 (서클 이미지이므로)
     * - user: 업로드한 사용자(서클 생성자/리더)
     */
    @Transactional
    public Image saveCoverImage(MultipartFile file, Long userId, Long circleId) throws IOException {
        if (!usersRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자가 존재하지 않습니다.");
        }

        String originalName = file.getOriginalFilename();
        String key = StorageKeyGenerator.generate("images", "circle", originalName);

        // 업로드 디렉토리 생성 후 파일 저장
        Path uploadDir = Paths.get(localUploadDir);
        Files.createDirectories(uploadDir);
        Path target = uploadDir.resolve(key);
        Path parent = target.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        file.transferTo(target.toFile());

        String storedPath = "/uploads/" + key;
        String uuid = UUID.randomUUID().toString();

        imageRepository.softDeleteByOwner(CIRCLE_IMAGE_DOMAIN, circleId);

        Image image = Image.builder()
                .name(originalName == null || originalName.isBlank() ? extractFileName(storedPath) : originalName)
                .uuid(uuid)
                .path(storedPath)
                .domain(CIRCLE_IMAGE_DOMAIN)
                .ownerId(circleId)
                .uploadedByUserId(userId)
                .ord(1L)
                .status(ImageStatus.USED)
                .build();

        return imageRepository.save(image);
    }

    @Transactional
    public Image saveCoverImageByUrl(String fileUrl, Long userId, Long circleId) {
        if (!usersRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자가 존재하지 않습니다.");
        }

        String uuid = UUID.randomUUID().toString();
        String normalizedPath = normalizeToUploadPath(fileUrl);
        String name = extractFileName(normalizedPath);

        imageRepository.softDeleteByOwner(CIRCLE_IMAGE_DOMAIN, circleId);

        Image image = Image.builder()
                .name(name)
                .uuid(uuid)
                .path(normalizedPath)
                .domain(CIRCLE_IMAGE_DOMAIN)
                .ownerId(circleId)
                .uploadedByUserId(userId)
                .ord(1L)
                .status(ImageStatus.USED)
                .build();

        return imageRepository.save(image);
    }

    private String extractFileName(String url) {
        if (url == null || url.isBlank()) {
            return "uploaded-file";
        }
        int slashIdx = url.lastIndexOf('/');
        if (slashIdx < 0 || slashIdx == url.length() - 1) {
            return "uploaded-file";
        }
        return url.substring(slashIdx + 1);
    }

    private String normalizeToUploadPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("fileUrl은 필수입니다.");
        }

        if (fileUrl.startsWith("/uploads/")) {
            return fileUrl;
        }

        String base = normalizeBaseUrl(localBaseUrl);
        String lowered = fileUrl.toLowerCase(Locale.ROOT);
        String loweredBase = base.toLowerCase(Locale.ROOT);
        if (lowered.startsWith(loweredBase + "/uploads/")) {
            return fileUrl.substring(base.length());
        }

        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath();
            if (path != null && path.startsWith("/uploads/")) {
                return path;
            }
        } catch (IllegalArgumentException ignored) {
            // path 형태가 아니면 아래에서 에러 처리
        }

        throw new IllegalArgumentException("지원하지 않는 fileUrl 형식입니다.");
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8080";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
