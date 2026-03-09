package com.soldesk.moa.admin.dto.statistic;

import lombok.Builder;

@Builder
public record CircleSurvivalDTO(
        long totalCircle,
        long activeCircle,
        double survivalRate) {

}
