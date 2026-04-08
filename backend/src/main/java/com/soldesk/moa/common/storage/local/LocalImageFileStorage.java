package com.soldesk.moa.common.storage.local;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.common.storage.FileStorage;

import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;

@Component
@Profile({ "local", "prod" })
@Log4j2
public class LocalImageFileStorage extends AbstractLocalFileStorage implements FileStorage {

    private static final int THUMBNAIL_MAX_WIDTH = 720;
    private static final int THUMBNAIL_MAX_HEIGHT = 480;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "svg");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml");

    public LocalImageFileStorage(
            @Value("${upload.root}") String localUploadDir,
            @Value("${upload.base-url}") String localBaseUrl) {
        super(Paths.get(localUploadDir, "images").toString(), localBaseUrl);
    }

    @Override
    protected void validateFile(String fileName, String contentType) {
        String extension = extractExtension(fileName).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않은 파일 확장자입니다.");
        }

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("허용되지 않은 contentType입니다.");
        }
    }

    @Override
    protected String resourceTypePrefix() {
        return "images";
    }

    @Override
    public void store(String key, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
        String safeKey = sanitizeKey(key);
        if (!safeKey.startsWith("images/")) {
            throw new IllegalArgumentException("지원하지 않는 key prefix입니다.");
        }

        Path baseDir = Paths.get(localUploadDir).normalize();
        Path target = baseDir.resolve(safeKey.substring("images/".length())).normalize();
        if (!target.startsWith(baseDir)) {
            throw new IllegalArgumentException("유효하지 않은 key 경로입니다.");
        }

        Path parent = target.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        file.transferTo(target.toFile());

        String thumbnailKey = toThumbnailKeyOrNull(safeKey);
        if (thumbnailKey != null && !"image/svg+xml".equalsIgnoreCase(file.getContentType())) {
            Path thumbnailTarget = baseDir.resolve(thumbnailKey.substring("images/".length())).normalize();
            if (thumbnailTarget.startsWith(baseDir)) {
                Path thumbnailParent = thumbnailTarget.getParent();
                if (thumbnailParent != null) {
                    Files.createDirectories(thumbnailParent);
                }
                try (InputStream input = Files.newInputStream(target)) {
                    Thumbnails.of(input)
                            .size(THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT)
                            .outputFormat("webp")
                            .toFile(thumbnailTarget.toFile());
                } catch (Exception e) {
                    log.warn("[UPLOAD] post thumbnail generation failed. key={}, thumbnailKey={}, reason={}",
                            safeKey, thumbnailKey, e.getMessage());
                }
            }
        }
    }
}

