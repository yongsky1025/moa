package com.soldesk.moa.image.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
public class ImageStorageService {

    @Value("${app.upload.post-image-dir:uploads/post-images}")
    private String postImageDir;

    @Value("${app.upload.post-image-url-prefix:/images/posts}")
    private String postImageUrlPrefix;

    public StoredImageFile storePostImage(MultipartFile file) {
        String extension = extractExtension(file.getOriginalFilename());
        String uuid = UUID.randomUUID().toString();
        String storedName = uuid + extension;

        LocalDate now = LocalDate.now();
        String dateDir = now.getYear() + "/" + String.format("%02d", now.getMonthValue()) + "/"
                + String.format("%02d", now.getDayOfMonth());
        Path targetDir = Paths.get(postImageDir, dateDir);
        Path targetFile = targetDir.resolve(storedName);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("image upload failed", e);
        }

        String imageUrl = normalizeUrl(postImageUrlPrefix) + "/" + dateDir.replace('\\', '/') + "/" + storedName;
        return new StoredImageFile(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : storedName,
                storedName,
                extension,
                file.getContentType(),
                file.getSize(),
                imageUrl);
    }

    public void deletePostImage(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return;
        }

        String normalizedPrefix = normalizeUrl(postImageUrlPrefix);
        if (!imageUrl.startsWith(normalizedPrefix + "/")) {
            return;
        }

        String relative = imageUrl.substring((normalizedPrefix + "/").length());
        Path filePath = Paths.get(postImageDir, relative);

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("temp image file delete failed. path={}", filePath, e);
        }
    }

    private String extractExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return ".bin";
        }

        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            return ".bin";
        }

        return filename.substring(index).toLowerCase();
    }

    private String normalizeUrl(String prefix) {
        if (!StringUtils.hasText(prefix)) {
            return "/images/posts";
        }

        if (prefix.endsWith("/")) {
            return prefix.substring(0, prefix.length() - 1);
        }
        return prefix;
    }

    public record StoredImageFile(
            String originalName,
            String storedName,
            String extension,
            String mimeType,
            long fileSize,
            String imageUrl) {
    }
}
