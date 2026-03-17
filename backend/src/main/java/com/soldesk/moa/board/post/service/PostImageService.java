package com.soldesk.moa.board.post.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.soldesk.moa.board.common.exception.BadRequestException;
import com.soldesk.moa.board.post.dto.PostRequestDTO;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.post.entity.PostImage;
import com.soldesk.moa.board.post.entity.constant.PostImageUsageType;
import com.soldesk.moa.board.post.repository.PostImageRepository;
import com.soldesk.moa.image.entity.Image;
import com.soldesk.moa.image.service.ImageStorageService;
import com.soldesk.moa.image.repository.ImageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostImageService {

    private final ImageRepository imageRepository;
    private final PostImageRepository postImageRepository;
    private final ImageStorageService imageStorageService;

    @Transactional
    public void attachTempImagesAndResolveThumbnail(Long userId, Post post, PostRequestDTO req) {
        List<PostImage> currentMappings = postImageRepository.findByPost_PostIdOrderBySortOrderAscPostImageIdAsc(post.getPostId());

        if (StringUtils.hasText(req.getTempKey())) {
            int nextSortOrder = currentMappings.stream()
                    .map(PostImage::getSortOrder)
                    .max(Integer::compareTo)
                    .orElse(-1) + 1;

            List<Image> tempImages = imageRepository
                    .findByUser_UserIdAndTempKeyOrderByOrdAscImageIdAsc(userId, req.getTempKey())
                    .stream()
                    .filter(Image::isTemporary)
                    .toList();

            for (Image image : tempImages) {
                image.markPermanent();

                if (postImageRepository.existsByPost_PostIdAndImage_ImageId(post.getPostId(), image.getImageId())) {
                    continue;
                }

                PostImage mapping = PostImage.builder()
                        .post(post)
                        .image(image)
                        .usageType(PostImageUsageType.CONTENT)
                        .sortOrder(nextSortOrder++)
                        .build();
                postImageRepository.save(mapping);
            }
        }

        List<PostImage> postImages = postImageRepository.findByPost_PostIdOrderBySortOrderAscPostImageIdAsc(post.getPostId());

        if (postImages.isEmpty()) {
            return;
        }

        PostImage thumbnail = resolveThumbnail(userId, post.getPostId(), req, postImages);
        for (PostImage mapping : postImages) {
            if (mapping.getUsageType() == PostImageUsageType.THUMBNAIL
                    && !Objects.equals(mapping.getPostImageId(), thumbnail.getPostImageId())) {
                mapping.changeUsageType(PostImageUsageType.CONTENT);
            }
        }
        thumbnail.changeUsageType(PostImageUsageType.THUMBNAIL);
    }

    @Transactional(readOnly = true)
    public String findThumbnailPath(Long postId) {
        return postImageRepository.findByPost_PostIdAndUsageType(postId, PostImageUsageType.THUMBNAIL)
                .map(mapping -> mapping.getImage().getPath())
                .orElse(null);
    }

    @Transactional
    public CleanupResult cleanUpOrphanTempImages() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Image> candidates = imageRepository.findByTemporaryIsTrueAndUploadedAtBefore(cutoff);

        int deletedCount = 0;
        int failedCount = 0;
        int skippedCount = 0;

        for (Image image : candidates) {
            try {
                if (!image.isTemporary() || postImageRepository.existsByImage_ImageId(image.getImageId())) {
                    skippedCount++;
                    continue;
                }

                imageStorageService.deletePostImage(image.getPath());
                imageRepository.delete(image);
                deletedCount++;
            } catch (Exception e) {
                failedCount++;
                log.warn("orphan temp image cleanup failed. imageId={}", image.getImageId(), e);
            }
        }

        return new CleanupResult(cutoff, candidates.size(), deletedCount, failedCount, skippedCount);
    }

    private PostImage resolveThumbnail(Long userId, Long postId, PostRequestDTO req, List<PostImage> mappings) {
        if (req.getThumbnailImageId() == null) {
            return mappings.stream()
                    .filter(mapping -> mapping.getUsageType() == PostImageUsageType.CONTENT)
                    .findFirst()
                    .orElse(mappings.get(0));
        }

        Image selected = imageRepository.findById(req.getThumbnailImageId())
                .orElseThrow(() -> new BadRequestException("thumbnail image not found"));

        if (!Objects.equals(selected.getUser().getUserId(), userId)) {
            throw new BadRequestException("thumbnail image owner mismatch");
        }

        return mappings.stream()
                .filter(mapping -> Objects.equals(mapping.getImage().getImageId(), selected.getImageId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("thumbnail image does not belong to post: " + postId));
    }

    public record CleanupResult(
            LocalDateTime cutoff,
            int candidateCount,
            int deletedCount,
            int failedCount,
            int skippedCount) {
    }
}
