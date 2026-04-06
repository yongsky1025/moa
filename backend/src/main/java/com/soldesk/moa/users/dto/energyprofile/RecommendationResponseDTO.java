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
    private int starRating;
    private String matchReason;

    private static final String[] AXIS_REASONS = {
        "소통 에너지 잘 맞아요",
        "교류 방식이 비슷해요",
        "활동 강도 딱 좋아요",
        "참여 부담 적당해요",
        "진행 스타일 잘 맞아요"
    };

    public RecommendationResponseDTO(Circle circle, double similarity, double[] userVector, double[] circleVector) {
        this.circleId = circle.getCircleId();
        this.name = circle.getName();
        this.description = circle.getDescription();
        this.categoryName = circle.getCategory().getCategoryName();
        this.similarity = Math.round(similarity * 100.0) / 100.0;
        this.status = circle.getStatus();
        this.maxMember = circle.getMaxMember();
        this.currentMember = circle.getCurrentMember();
        this.coverImageUrl = circle.getCoverImage() != null ? circle.getCoverImage().getPath() : null;

        // 별 등급 산출
        if (similarity >= 0.75) {
            this.starRating = 3;
        } else if (similarity >= 0.55) {
            this.starRating = 2;
        } else {
            this.starRating = 1;
        }

        // 5축 중 가장 차이가 작은 축 → 매칭 이유
        int bestIdx = 0;
        double minDiff = Double.MAX_VALUE;
        for (int i = 0; i < userVector.length; i++) {
            double diff = Math.abs(userVector[i] - circleVector[i]);
            if (diff < minDiff) {
                minDiff = diff;
                bestIdx = i;
            }
        }
        this.matchReason = AXIS_REASONS[bestIdx];
    }

}
