package com.soldesk.moa.circle.dto;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import lombok.Getter;

@Getter
public class CircleResponseDTO {

    private Long circleId;
    private String name;
    private String description;
    private CircleStatus status;
    private int maxMember;
    private int currentMember;
    private String categoryName;

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
        this.categoryName = circle.getCategory().getCategoryName();
    }
}