package com.soldesk.moa.users.service;

import org.springframework.stereotype.Component;

import com.soldesk.moa.users.dto.energyprofile.EnergyTypePreview;
import com.soldesk.moa.users.entity.constant.EnergyType;

@Component
public class EnergyTypePreviewMapper {

    public EnergyTypePreview getPreview(EnergyType energyType) {
        return switch (energyType) {
            case QUIET_IMMERSION -> new EnergyTypePreview(1, 1, 3, 2, 2);
            case LIGHT_STROLL -> new EnergyTypePreview(2, 2, 2, 4, 2);
            case CALM_EXCHANGE -> new EnergyTypePreview(2, 4, 3, 2, 2);
            case SMALL_ACTION -> new EnergyTypePreview(2, 4, 2, 4, 3);
            case GENTLE_OBSERVER -> new EnergyTypePreview(4, 1, 3, 2, 2);
            case PACE_COMPANION -> new EnergyTypePreview(4, 2, 2, 4, 2);
            case STRUCTURED_EXCHANGE -> new EnergyTypePreview(4, 4, 4, 2, 3);
            case ENERGY_SPREADER -> new EnergyTypePreview(5, 5, 3, 5, 4);
        };
    }
}
