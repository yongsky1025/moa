package com.soldesk.moa.common.storage.schedule;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.storage.FileStorage;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@Profile({ "local", "dev" })
@RequiredArgsConstructor
@Log4j2
public class UnusedPostUploadCleanupScheduler {

    private final ImageRepository imageRepository;
    private final FileStorage fileStorage;

    @Value("${app.local-image-upload-dir}")
    private String localUploadDir;

    @Value("${app.cleanup.unused-post-upload-hours:24}")
    private long unusedPostUploadHours;

    // 매일 새벽 4시 30분: TEMP 이미지 중 24시간 지난 데이터(파일+DB) 정리
    @Transactional
    @Scheduled(cron = "0 30 4 * * ?")
    public void cleanupUnusedPostUploads() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(unusedPostUploadHours);
        List<Image> expiredTemps = imageRepository.findByStatusAndCreateDateBefore(ImageStatus.TEMP, cutoff);
        if (expiredTemps.isEmpty()) {
            return;
        }

        List<Long> deletedIds = new ArrayList<>();
        int deletedFileCount = 0;
        for (Image image : expiredTemps) {
            try {
                fileStorage.delete(toStorageKey(image.getPath()));
                deletedFileCount++;
            } catch (RuntimeException ignored) {
                continue;
            }
            deletedIds.add(image.getImageId());
        }

        int deletedDbCount = 0;
        if (!deletedIds.isEmpty()) {
            deletedDbCount = imageRepository.deleteByImageIdsAndStatus(deletedIds, ImageStatus.TEMP);
        }
        Path imagePostDir = Paths.get(localUploadDir).normalize().resolve("images").resolve("post").normalize();
        int deletedDirCount = deleteEmptyDirectories(imagePostDir);

        if (deletedDbCount > 0 || deletedFileCount > 0 || deletedDirCount > 0) {
            log.info("[TEMP-IMAGE-CLEANUP] cutoff={}, files={}, dbRows={}, emptyDirs={}",
                    cutoff, deletedFileCount, deletedDbCount, deletedDirCount);
        }
    }

    private String toStorageKey(String path) {
        if (path == null || path.isBlank()) {
            return "";
        }
        if (path.startsWith("/uploads/")) {
            return path.substring("/uploads/".length());
        }
        return path;
    }

    private int deleteEmptyDirectories(Path postUploadDir) {
        if (!Files.exists(postUploadDir) || !Files.isDirectory(postUploadDir)) {
            return 0;
        }

        int deleted = 0;
        try (Stream<Path> stream = Files.walk(postUploadDir)) {
            List<Path> directories = stream
                    .filter(Files::isDirectory)
                    .filter(path -> !path.equals(postUploadDir))
                    .sorted(Comparator.reverseOrder())
                    .toList();

            for (Path dir : directories) {
                try (Stream<Path> children = Files.list(dir)) {
                    if (children.findAny().isEmpty()) {
                        Files.deleteIfExists(dir);
                        deleted++;
                    }
                } catch (Exception ignored) {
                    // 개별 폴더 삭제 실패는 다음 회차에서 재시도
                }
            }
        } catch (Exception ignored) {
            return deleted;
        }
        return deleted;
    }
}
