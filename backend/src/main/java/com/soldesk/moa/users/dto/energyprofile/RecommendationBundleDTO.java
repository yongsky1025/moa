package com.soldesk.moa.users.dto.energyprofile;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RecommendationBundleDTO {

    // 5축 전체 유사도 기준 (socialLoad, interactionMode, activityIntensity, commitmentLevel, structureLevel)
    private List<RecommendationResponseDTO> overall;

    // 2축 사회적 에너지 기준 (socialLoad + interactionMode)
    private List<RecommendationResponseDTO> social;

    // 3축 활동/몰입 스타일 기준 (activityIntensity + commitmentLevel + structureLevel)
    private List<RecommendationResponseDTO> activity;

}
