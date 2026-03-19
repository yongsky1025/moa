package com.soldesk.moa.users.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.CircleEnergyProfile;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleEnergyProfileRepository;
import com.soldesk.moa.users.dto.energyprofile.RecommendationResponseDTO;
import com.soldesk.moa.users.entity.UsersEnergyProfile;
import com.soldesk.moa.users.repository.UserEnergyProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final UserEnergyProfileRepository userEnergyProfileRepository;
    private final CircleEnergyProfileRepository circleEnergyProfileRepository;

    /**
     * 축별 가중치(에너지 소모 영향도 순, 0.04 등차, 합계
     * 1) socialLoad(0.28) : 인원수 = 사회적 정보 처리량 - 에너지 소모에 가장 큰 영향
     * 2) interactionMode(0.24) : 소통 깊이 - 인지적 에너지 소모에 직결
     * 3) activityIntensity(0.20) : 신체적 에너지 - 활동 강도
     * 4) commitmentLevel(0.16) : 심리적 부담 - 지속성/몰입 부담
     * 5) structureLevel(0.12) : 선호도 성격 - 에너지 상관 상대적으로 낮음
     **/

    private static final double[] WEIGHTS = {
            0.28, // socialLoad
            0.24, // interactionMode
            0.20, // activityIntensity
            0.16, // commitmentLevel
            0.12 // structureLevel
    };

    public List<RecommendationResponseDTO> recommend(Long userId, int limit) {

        // 1. 유저 에너지 프로필 조회
        UsersEnergyProfile userProfile = userEnergyProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new IllegalStateException("에너지 프로필이 없습니다. 온보딩을 완료해주세요."));

        double[] userVector = toVector(userProfile);

        // 2. 모집중인 서클의 에너지 프로필 조회
        List<CircleEnergyProfile> profiles = circleEnergyProfileRepository.findByCircle_Status(CircleStatus.OPEN);

        // 3. 가중 유클리드 유사도 계산 + 점수순 정렬
        return profiles.stream()
                .map(ep -> {
                    double[] circleVector = toVector(ep);
                    double similarity = weightedEuclideanSimilarity(userVector, circleVector);
                    return new RecommendationResponseDTO(ep.getCircle(), similarity);
                })
                .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // === 벡터 변환 ===

    /**
     * 벡터 순서
     * [socialLoad,interactionMode,activityIntensity,commitmentLevel,structureLevel]
     */
    // 유저 프로필 → 벡터
    private double[] toVector(UsersEnergyProfile profile) {
        return new double[] {
                profile.getSocialLoad(),
                profile.getInteractionMode(),
                profile.getActivityIntensity(),
                profile.getCommitmentLevel(),
                profile.getStructureLevel(),
        };
    }

    // 서클 → 벡터
    private double[] toVector(CircleEnergyProfile circle) {
        return new double[] {
                circle.getSocialLoad(),
                circle.getInteractionMode(),
                circle.getActivityIntensity(),
                circle.getCommitmentLevel(),
                circle.getStructureLevel(),
        };
    }

    // === 가중 유클리드 유사도(Weighted Euclidean Similarity) ===

    /**
     * 가중 유클리드 유사도: 1 / (1 + √Σ(w_i × (a_i - b_i)²))
     * 각 축에 가중치를 곱해서, 중요한 축의 차이가 유사도에 더 크게 반영됨
     * 결과: 0~1 범위 (1에 가까울수록 유사)
     */
    private double weightedEuclideanSimilarity(double[] a, double[] b) {
        double sum = 0.0;
        for (int i = 0; i < a.length; i++) {
            double diff = a[i] - b[i];
            sum += WEIGHTS[i] * diff * diff;
        }
        return 1.0 / (1.0 + Math.sqrt(sum));
    }

}