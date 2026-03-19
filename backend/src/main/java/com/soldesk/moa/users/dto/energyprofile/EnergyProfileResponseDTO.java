package com.soldesk.moa.users.dto.energyprofile;

import com.soldesk.moa.users.entity.UsersEnergyProfile;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EnergyProfileResponseDTO {

    private Long profileId;
    private Integer socialLoad;
    private Integer interactionMode;
    private Integer structureLevel;
    private Integer activityIntensity;
    private Integer commitmentLevel;

    // 에너지 타입 정보
    private String energyTypeName; // "고요한 몰입형"
    private String energyTypeDescription; // 타입 설명
    private String recommendedCategories; // 추천 카테고리

    public static EnergyProfileResponseDTO from(UsersEnergyProfile profile) {
        return EnergyProfileResponseDTO.builder()
                .profileId(profile.getProfileId())
                .socialLoad(profile.getSocialLoad())
                .interactionMode(profile.getInteractionMode())
                .structureLevel(profile.getStructureLevel())
                .activityIntensity(profile.getActivityIntensity())
                .commitmentLevel(profile.getCommitmentLevel())
                .energyTypeName(profile.getEnergyType().getTypeName())
                .energyTypeDescription(profile.getEnergyType().getDescription())
                .recommendedCategories(profile.getEnergyType().getRecommendedCategories())
                .build();
    }
}