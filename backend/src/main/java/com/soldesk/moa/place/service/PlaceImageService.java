package com.soldesk.moa.place.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.place.repository.PlaceImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceImageService {

    private final PlaceImageRepository placeImageRepository;

    /** 여러 장소의 대표이미지 경로를 한 번에 조회 (placeId → imagePath) */
    public Map<Long, String> getRepresentativeImages(List<Long> placeIds) {
        if (placeIds.isEmpty()) return Map.of();
        return placeImageRepository.findRepresentativeImages(ImageDomain.PLACE, placeIds)
                .stream()
                .collect(Collectors.toMap(
                        Image::getOwnerId,
                        image -> toThumbnailPath(image.getPath(), image.getName())));
    }

    /** 장소 이미지 경로 목록 조회 (ord 오름차순) */
    public List<String> getPlaceImages(Long placeId) {
        return placeImageRepository.findByDomainAndOwnerIdAndDeletedFalse(ImageDomain.PLACE, placeId)
                .stream()
                .sorted(Comparator.comparingLong(Image::getOrd))
                .map(image -> toOriginalPath(image.getPath(), image.getName()))
                .toList();
    }

    private String toThumbnailPath(String path, String originalName) {
        if (path == null || path.isBlank()) {
            return path;
        }

        String normalized = path;
        int slashIdx = normalized.lastIndexOf('/');
        if (slashIdx < 0) {
            return normalized;
        }

        String directory = normalized.substring(0, slashIdx);
        String filename = normalized.substring(slashIdx + 1);
        String baseName = extractBaseName(filename);

        if (!directory.endsWith("/thumbnails")) {
            directory = directory + "/thumbnails";
        }
        return directory + "/" + baseName + "_thm.webp";
    }

    private String toOriginalPath(String path, String originalName) {
        if (path == null || path.isBlank()) {
            return path;
        }

        String normalized = path;
        int slashIdx = normalized.lastIndexOf('/');
        if (slashIdx < 0) {
            return normalized;
        }

        String directory = normalized.substring(0, slashIdx);
        String filename = normalized.substring(slashIdx + 1);

        if (directory.endsWith("/thumbnails")) {
            directory = directory.substring(0, directory.length() - "/thumbnails".length());
            if (originalName != null && !originalName.isBlank()) {
                return directory + "/" + originalName;
            }
            return directory + "/" + restoreFileName(filename);
        }

        if (filename.endsWith("_thm.webp")) {
            if (originalName != null && !originalName.isBlank()) {
                return directory + "/" + originalName;
            }
            return directory + "/" + restoreFileName(filename);
        }

        return normalized;
    }

    private String extractBaseName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "image";
        }
        String target = fileName;
        if (target.endsWith("_thm.webp")) {
            return target.substring(0, target.length() - "_thm.webp".length());
        }
        int dotIdx = target.lastIndexOf('.');
        return dotIdx > 0 ? target.substring(0, dotIdx) : target;
    }

    private String restoreFileName(String thumbName) {
        if (thumbName == null || thumbName.isBlank()) {
            return thumbName;
        }
        if (thumbName.endsWith("_thm.webp")) {
            return thumbName.substring(0, thumbName.length() - "_thm.webp".length()) + ".webp";
        }
        return thumbName;
    }
}
