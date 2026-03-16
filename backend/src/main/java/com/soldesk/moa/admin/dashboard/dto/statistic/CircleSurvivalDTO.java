package com.soldesk.moa.admin.dashboard.dto.statistic;

import lombok.Builder;

@Builder
public record CircleSurvivalDTO(
                long totalCircle,
                long activeCircle,
                double survivalRate) {

}
