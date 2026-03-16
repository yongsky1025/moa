package com.soldesk.moa.users.dto.energyprofile;

import com.soldesk.moa.circle.entity.Circle;
import lombok.Getter;

@Getter
public class RecommendationResponseDTO {

    private Long circleId;
    private String name;
    private String description;
    private String categoryName;
    private double similarity;
    // 나중에 LLM 추천 이유 추가
    private String reason;

    public RecommendationResponseDTO(Circle circle, double similarity) {
        this.circleId = circle.getCircleId();
        this.name = circle.getName();
        this.description = circle.getDescription();
        this.categoryName = circle.getCategory().getCategoryName();
        this.similarity = Math.round(similarity * 100.0) / 100.0;
    }

}
