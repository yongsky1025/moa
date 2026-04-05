package com.soldesk.moa.users.dto.energyprofile;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EnergyProfileRequestDTO {

    @NotNull(message = "socialLoad는 필수입니다.")
    @Min(value = 1, message = "socialLoad는 1 이상이어야 합니다.")
    @Max(value = 5, message = "socialLoad는 5 이하여야 합니다.")
    private Integer socialLoad;

    @NotNull(message = "interactionMode는 필수입니다.")
    @Min(value = 1, message = "interactionMode는 1 이상이어야 합니다.")
    @Max(value = 5, message = "interactionMode는 5 이하여야 합니다.")
    private Integer interactionMode;

    @NotNull(message = "structureLevel은 필수입니다.")
    @Min(value = 1, message = "structureLevel은 1 이상이어야 합니다.")
    @Max(value = 5, message = "structureLevel은 5 이하여야 합니다.")
    private Integer structureLevel;

    @NotNull(message = "activityIntensity는 필수입니다.")
    @Min(value = 1, message = "activityIntensity는 1 이상이어야 합니다.")
    @Max(value = 5, message = "activityIntensity는 5 이하여야 합니다.")
    private Integer activityIntensity;

    @NotNull(message = "commitmentLevel은 필수입니다.")
    @Min(value = 1, message = "commitmentLevel은 1 이상이어야 합니다.")
    @Max(value = 5, message = "commitmentLevel은 5 이하여야 합니다.")
    private Integer commitmentLevel;
}
