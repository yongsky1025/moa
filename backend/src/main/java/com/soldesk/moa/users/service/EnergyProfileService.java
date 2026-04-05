package com.soldesk.moa.users.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.users.dto.energyprofile.EnergyProfileRequestDTO;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileResponseDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.UsersEnergyProfile;
import com.soldesk.moa.users.entity.constant.EnergyType;
import com.soldesk.moa.users.repository.UserEnergyProfileRepository;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnergyProfileService {

        private final UserEnergyProfileRepository energyProfileRepository;
        private final UsersRepository usersRepository;

        @Transactional
        public EnergyProfileResponseDTO createProfile(Long userId, EnergyProfileRequestDTO request) {

                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

                // idempotent: 이미 프로필이 있으면 기존 프로필 반환
                var existing = energyProfileRepository.findByUser(user);
                if (existing.isPresent()) {
                        return EnergyProfileResponseDTO.from(existing.get());
                }

                // 3축 기반 타입 분류
                EnergyType energyType = EnergyType.classify(
                                request.getSocialLoad(),
                                request.getInteractionMode(),
                                request.getActivityIntensity());

                UsersEnergyProfile profile = UsersEnergyProfile.builder()
                                .user(user)
                                .socialLoad(request.getSocialLoad())
                                .interactionMode(request.getInteractionMode())
                                .structureLevel(request.getStructureLevel())
                                .activityIntensity(request.getActivityIntensity())
                                .commitmentLevel(request.getCommitmentLevel())
                                .energyType(energyType)
                                .build();

                energyProfileRepository.save(profile);

                // 온보딩 완료 시점 기록
                user.completeOnboarding();

                return EnergyProfileResponseDTO.from(profile);
        }

        // 에너지 프로필 수정 (re 온보딩 / 설정에서 변경)
        @Transactional
        public EnergyProfileResponseDTO updateProfile(Long userId, EnergyProfileRequestDTO request) {

                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

                UsersEnergyProfile profile = energyProfileRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalStateException(
                                                "에너지 프로필이 존재하지 않습니다. 온보딩을 먼저 완료해주세요."));

                // updateScores 내부에서 타입도 재분류됨
                profile.updateScores(
                                request.getSocialLoad(),
                                request.getInteractionMode(),
                                request.getStructureLevel(),
                                request.getActivityIntensity(),
                                request.getCommitmentLevel());

                // 꼬인 계정 복구 : 프로필은 있는데 완료 안 눌렀을 때
                if (user.getOnboardingCompletedAt() == null) {
                        user.completeOnboarding();
                }

                return EnergyProfileResponseDTO.from(profile);
        }

        // 내 에너지 프로필 조회
        @Transactional(readOnly = true)
        public EnergyProfileResponseDTO getProfile(Long userId) {

                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

                UsersEnergyProfile profile = energyProfileRepository.findByUser(user)
                                .orElseThrow(() -> new IllegalStateException("에너지 프로필이 존재하지 않습니다."));

                return EnergyProfileResponseDTO.from(profile);
        }
}