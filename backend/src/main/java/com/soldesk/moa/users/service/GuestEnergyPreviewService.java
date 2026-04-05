package com.soldesk.moa.users.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.soldesk.moa.common.exception.InvalidTokenException;
import com.soldesk.moa.security.JwtTokenProvider;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileRequestDTO;
import com.soldesk.moa.users.dto.energyprofile.EnergyTypePreview;
import com.soldesk.moa.users.dto.energyprofile.GuestEnergyPreviewResponseDTO;
import com.soldesk.moa.users.dto.energyprofile.GuestEnergyTokenResponseDTO;
import com.soldesk.moa.users.entity.constant.EnergyType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuestEnergyPreviewService {

    private final JwtTokenProvider jwtTokenProvider;
    private final EnergyTypePreviewMapper energyTypePreviewMapper;

    public GuestEnergyTokenResponseDTO issueToken(EnergyProfileRequestDTO request) {
        EnergyType energyType = EnergyType.classify(
                request.getSocialLoad(),
                request.getInteractionMode(),
                request.getActivityIntensity());

        String guestToken = jwtTokenProvider.createGuestEnergyPreviewToken(
                energyType.name(),
                request.getSocialLoad(),
                request.getInteractionMode(),
                request.getStructureLevel(),
                request.getActivityIntensity(),
                request.getCommitmentLevel());

        return new GuestEnergyTokenResponseDTO(guestToken);
    }

    public GuestEnergyPreviewResponseDTO getPreview(String token) {
        validateGuestToken(token);

        String energyTypeCode = jwtTokenProvider.getGuestEnergyTypeCodeFromToken(token);

        EnergyType energyType;
        try {
            energyType = EnergyType.valueOf(energyTypeCode);
        } catch (IllegalArgumentException e) {
            throw new InvalidTokenException("유효하지 않은 에너지 타입 코드입니다.");
        }

        EnergyTypePreview preview = energyTypePreviewMapper.getPreview(energyType);

        return GuestEnergyPreviewResponseDTO.builder()
                .energyTypeName(energyType.getTypeName())
                .energyTypeDescription(energyType.getDescription())
                .recommendedCategories(energyType.getRecommendedCategories())
                .exampleSocialLoad(preview.getSocialLoad())
                .exampleInteractionMode(preview.getInteractionMode())
                .exampleStructureLevel(preview.getStructureLevel())
                .exampleActivityIntensity(preview.getActivityIntensity())
                .exampleCommitmentLevel(preview.getCommitmentLevel())
                .locked(true)
                .lockMessage("회원가입하면 내 실제 결과와 맞춤 추천 모임을 확인할 수 있어요.")
                .build();
    }

    private void validateGuestToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new InvalidTokenException("게스트 에너지 토큰이 필요합니다.");
        }

        if (!jwtTokenProvider.isValidToken(token) || !jwtTokenProvider.isGuestEnergyPreviewToken(token)) {
            throw new InvalidTokenException("유효한 게스트 에너지 토큰이 아닙니다.");
        }
    }
}
