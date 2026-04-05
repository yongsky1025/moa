package com.soldesk.moa.users.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.exception.InvalidTokenException;
import com.soldesk.moa.security.JwtTokenProvider;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileRequestDTO;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileResponseDTO;
import com.soldesk.moa.users.dto.energyprofile.ImportGuestTokenRequestDTO;
import com.soldesk.moa.users.dto.energyprofile.RecommendationBundleDTO;
import com.soldesk.moa.users.service.EnergyProfileService;
import com.soldesk.moa.users.service.RecommendationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/users/me/energy-profile")
@RequiredArgsConstructor
public class EnergyProfileController {

    private final EnergyProfileService energyProfileService;
    private final RecommendationService recommendationService;
    private final JwtTokenProvider jwtTokenProvider;

    // 온보딩 완료 : 에너지 프로필 최초 저장
    @PostMapping("/create")
    public ResponseEntity<EnergyProfileResponseDTO> createEnergyProfile(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody EnergyProfileRequestDTO request) {

        EnergyProfileResponseDTO response = energyProfileService.createProfile(authUser.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 에너지 프로필 수정
    @PutMapping("/update")
    public ResponseEntity<EnergyProfileResponseDTO> updateProfile(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody EnergyProfileRequestDTO request) {

        EnergyProfileResponseDTO response = energyProfileService.updateProfile(authUser.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    // 내 에너지 프로필 조회
    @GetMapping("/check")
    public ResponseEntity<EnergyProfileResponseDTO> getProfile(
            @AuthenticationPrincipal AuthUserDTO authUser) {

        EnergyProfileResponseDTO response = energyProfileService.getProfile(authUser.getUserId());
        return ResponseEntity.ok(response);
    }

    // 게스트 에너지 토큰으로 프로필 가져오기 (온보딩 시 사용)
    @PostMapping("/import-guest")
    public ResponseEntity<EnergyProfileResponseDTO> importFromGuestToken(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody ImportGuestTokenRequestDTO request) {

        String token = request.getGuestToken();

        if (!jwtTokenProvider.isValidToken(token) || !jwtTokenProvider.isGuestEnergyPreviewToken(token)) {
            throw new InvalidTokenException("유효한 게스트 에너지 토큰이 아닙니다.");
        }

        EnergyProfileRequestDTO profileRequest = new EnergyProfileRequestDTO(
                jwtTokenProvider.getGuestScoreFromToken(token, "socialLoad"),
                jwtTokenProvider.getGuestScoreFromToken(token, "interactionMode"),
                jwtTokenProvider.getGuestScoreFromToken(token, "structureLevel"),
                jwtTokenProvider.getGuestScoreFromToken(token, "activityIntensity"),
                jwtTokenProvider.getGuestScoreFromToken(token, "commitmentLevel"));

        EnergyProfileResponseDTO response = energyProfileService.createProfile(authUser.getUserId(), profileRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 에너지 기반 서클 추천
    @PostMapping("/recommend")
    public ResponseEntity<RecommendationBundleDTO> recommend(@AuthenticationPrincipal AuthUserDTO authUserDTO,
            @RequestParam(defaultValue = "5") @Min(1) @Max(20) int limit) {

        RecommendationBundleDTO recommendations = recommendationService.recommend(authUserDTO.getUserId(), limit);
        return ResponseEntity.ok(recommendations);
    }

}
