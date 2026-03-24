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
    private CircleRole myRole;

    public static CircleResponseDTO from(Circle circle) {
        return new CircleResponseDTO(circle);
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
        this.coverImageUrl = circle.getCoverImage() != null ? circle.getCoverImage().getPath() : null;
    }

    public CircleResponseDTO(Circle circle, CircleRole myRole) {
        this(circle);
        this.myRole = myRole;
    }
}
