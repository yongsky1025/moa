package com.soldesk.moa.common.storage.local;

import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.soldesk.moa.common.storage.GeneralFileStorage;

@Component
@Profile({ "local", "dev" })
public class LocalGeneralFileStorage extends AbstractLocalFileStorage implements GeneralFileStorage {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "hwp", "hwpx", "zip", "7z", "csv", "json", "xml", "md");

    public LocalGeneralFileStorage(
            @Value("${upload.root}") String localUploadDir,
            @Value("${upload.base-url}") String localBaseUrl) {
        super(Paths.get(localUploadDir, "files").toString(), localBaseUrl);
    }

    @Override
    protected void validateFile(String fileName, String contentType) {
        String extension = extractExtension(fileName).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않은 파일 확장자입니다.");
        }

        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("contentType은 필수입니다.");
        }
        String normalizedContentType = contentType.toLowerCase(Locale.ROOT);
        if (normalizedContentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지는 이미지 업로드 API를 사용하세요.");
        }
        if (!(normalizedContentType.startsWith("application/") || normalizedContentType.startsWith("text/"))) {
            throw new IllegalArgumentException("허용되지 않은 contentType입니다.");
        }
    }

    @Override
    protected String resourceTypePrefix() {
        return "files";
    }
}
