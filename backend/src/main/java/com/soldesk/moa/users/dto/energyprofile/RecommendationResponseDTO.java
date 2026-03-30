package com.soldesk.moa.users.dto.energyprofile;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import lombok.Getter;

@Getter
public class RecommendationResponseDTO {

    private Long circleId;
    private String name;
    private String description;
    private String categoryName;
    private double similarity;
    private CircleStatus status;
    private int maxMember;
    private int currentMember;
    private String coverImageUrl;

    public RecommendationResponseDTO(Circle circle, double similarity) {
        this.circleId = circle.getCircleId();
        this.name = circle.getName();
        this.description = circle.getDescription();
        this.categoryName = circle.getCategory().getCategoryName();
        this.similarity = Math.round(similarity * 100.0) / 100.0;
        this.status = circle.getStatus();
        this.maxMember = circle.getMaxMember();
        this.currentMember = circle.getCurrentMember();
        this.coverImageUrl = circle.getCoverImage() != null ? circle.getCoverImage().getPath() : null;
    }

}
