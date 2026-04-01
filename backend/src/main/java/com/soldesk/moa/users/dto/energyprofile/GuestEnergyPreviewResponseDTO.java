package com.soldesk.moa.users.dto.energyprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GuestEnergyPreviewResponseDTO {

    private String energyTypeName;
    private String energyTypeDescription;
    private String recommendedCategories;

    private Integer exampleSocialLoad;
    private Integer exampleInteractionMode;
    private Integer exampleStructureLevel;
    private Integer exampleActivityIntensity;
    private Integer exampleCommitmentLevel;

    private boolean locked;
    private String lockMessage;

}
