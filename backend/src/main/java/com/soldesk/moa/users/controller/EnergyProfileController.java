package com.soldesk.moa.users.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileRequestDTO;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileResponseDTO;
import com.soldesk.moa.users.dto.energyprofile.RecommendationResponseDTO;
import com.soldesk.moa.users.service.EnergyProfileService;
import com.soldesk.moa.users.service.RecommendationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

import java.util.List;

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

    // 에너지 기반 서클 추천
    @PostMapping("/recommend")
    public ResponseEntity<List<RecommendationResponseDTO>> recommend(@AuthenticationPrincipal AuthUserDTO authUserDTO,
            @RequestParam(defaultValue = "5") @Min(1) @Max(20) int limit) {

        List<RecommendationResponseDTO> recommendations = recommendationService.recommend(authUserDTO.getUserId(),
                limit);
        return ResponseEntity.ok(recommendations);
    }

}
