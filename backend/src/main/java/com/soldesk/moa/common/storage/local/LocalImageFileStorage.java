package com.soldesk.moa.common.storage.local;

import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.soldesk.moa.common.storage.FileStorage;

@Component
@Profile({ "local", "dev" })
public class LocalImageFileStorage extends AbstractLocalFileStorage implements FileStorage {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "svg");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml");

    public LocalImageFileStorage(
            @Value("${app.local-upload-dir}") String localUploadDir,
            @Value("${app.local-base-url}") String localBaseUrl) {
        super(localUploadDir, localBaseUrl);
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
}
