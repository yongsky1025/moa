package com.soldesk.moa.users.dto.energyprofile;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EnergyTypePreview {
    private final int socialLoad;
    private final int interactionMode;
    private final int structureLevel;
    private final int activityIntensity;
    private final int commitmentLevel;
}
