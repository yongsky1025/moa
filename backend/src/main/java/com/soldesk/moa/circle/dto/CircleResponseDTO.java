package com.soldesk.moa.circle.dto;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import lombok.Getter;

@Getter
public class CircleResponseDTO {

    private Long circleId;
    private String name;
    private String description;
    private CircleStatus status;
    private int maxMember;
    private int currentMember;
    private Long categoryId;
    private String categoryName;
    private String coverImageUrl;
    private String coverThumbnailUrl;
    private CircleRole myRole;
    private long likeCount;

    public static CircleResponseDTO from(Circle circle) {
        return new CircleResponseDTO(circle);
    }

    public static CircleResponseDTO from(Circle circle, long likeCount) {
        CircleResponseDTO dto = new CircleResponseDTO(circle);
        dto.likeCount = likeCount;
        return dto;
    }

    public CircleResponseDTO(Circle circle) {
        this.circleId = circle.getCircleId();
        this.name = circle.getName();
        this.description = circle.getDescription();
        this.status = circle.getStatus();
        this.maxMember = circle.getMaxMember();
        this.currentMember = circle.getCurrentMember();
        this.categoryId = circle.getCategory().getCategoryId();
        this.categoryName = circle.getCategory().getCategoryName();
        String rawPath = circle.getCoverImage() != null ? circle.getCoverImage().getPath() : null;
        String rawName = circle.getCoverImage() != null ? circle.getCoverImage().getName() : null;
        this.coverImageUrl = toOriginalPath(rawPath, rawName);
        this.coverThumbnailUrl = toThumbnailPath(rawPath, rawName);
    }

    public CircleResponseDTO(Circle circle, CircleRole myRole) {
        this(circle);
        this.myRole = myRole;
    }

    private String toThumbnailPath(String path, String originalName) {
        if (path == null || path.isBlank()) {
            return path;
        }

        int slashIdx = path.lastIndexOf('/');
        if (slashIdx < 0) {
            return path;
        }

        String directory = path.substring(0, slashIdx);
        String filename = path.substring(slashIdx + 1);
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

        int slashIdx = path.lastIndexOf('/');
        if (slashIdx < 0) {
            return path;
        }

        String directory = path.substring(0, slashIdx);
        String filename = path.substring(slashIdx + 1);

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

        return path;
    }

    private String extractBaseName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "image";
        }
        if (fileName.endsWith("_thm.webp")) {
            return fileName.substring(0, fileName.length() - "_thm.webp".length());
        }
        int dotIdx = fileName.lastIndexOf('.');
        return dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName;
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
