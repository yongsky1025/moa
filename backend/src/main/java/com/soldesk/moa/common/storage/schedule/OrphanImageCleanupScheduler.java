package com.soldesk.moa.common.storage.schedule;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.place.repository.PlaceRepository;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@Profile({ "local", "dev" })
@RequiredArgsConstructor
@Log4j2
public class OrphanImageCleanupScheduler {

    private final ImageRepository imageRepository;
    private final FileStorage fileStorage;
    private final PostRepository postRepository;
    private final CircleRepository circleRepository;
    private final UsersRepository usersRepository;
    private final PlaceRepository placeRepository;

    @Value("${app.cleanup.orphan-image-hours:24}")
    private long orphanImageHours;

    // 매일 새벽 4시 50분: owner가 이미 삭제된 고아 이미지 정리
    @Transactional
    @Scheduled(cron = "0 50 4 * * ?")
    public void cleanupOrphanImages() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(orphanImageHours);
        List<Image> candidates = imageRepository.findByOwnerIdIsNotNullAndCreateDateBefore(cutoff);
        if (candidates.isEmpty()) {
            return;
        }

        List<Long> deletedIds = new ArrayList<>();
        int deletedFileCount = 0;
        int orphanCount = 0;

        for (Image image : candidates) {
            if (!isOrphan(image)) {
                continue;
            }
            orphanCount++;
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
            deletedDbCount = imageRepository.deleteByImageIds(deletedIds);
        }

        if (orphanCount > 0 || deletedDbCount > 0 || deletedFileCount > 0) {
            log.info("[ORPHAN-IMAGE-CLEANUP] cutoff={}, orphanCandidates={}, files={}, dbRows={}",
                    cutoff, orphanCount, deletedFileCount, deletedDbCount);
        }
    }

    private boolean isOrphan(Image image) {
        Long ownerId = image.getOwnerId();
        if (ownerId == null) {
            return false;
        }
        ImageDomain domain = image.getDomain();
        if (domain == null) {
            return false;
        }
        return switch (domain) {
            case POST -> !postRepository.existsById(ownerId);
            case CIRCLE -> !circleRepository.existsById(ownerId);
            case USER -> !usersRepository.existsById(ownerId);
            case PLACE -> !placeRepository.existsById(ownerId);
            default -> false;
        };
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
}
