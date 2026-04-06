package com.soldesk.moa.users.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.CircleEnergyProfile;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleEnergyProfileRepository;
import com.soldesk.moa.users.dto.energyprofile.RecommendationBundleDTO;
import com.soldesk.moa.users.dto.energyprofile.RecommendationResponseDTO;
import com.soldesk.moa.users.entity.UsersEnergyProfile;
import com.soldesk.moa.users.repository.UserEnergyProfileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

        private final UserEnergyProfileRepository userEnergyProfileRepository;
        private final CircleEnergyProfileRepository circleEnergyProfileRepository;
        private final ChatModel chatModel;

        /**
         * 5축 전체 가중치 (에너지 소모 영향도 순, 합계 1)
         * 1) socialLoad(0.28) : 사회적 정보 처리량 - 에너지 소모에 가장 큰 영향
         * 2) interactionMode(0.24) : 소통 깊이 - 인지적 에너지 소모에 직결
         * 3) activityIntensity(0.20): 신체적 에너지 - 활동 강도
         * 4) commitmentLevel(0.16) : 심리적 부담 - 지속성/몰입 부담
         * 5) structureLevel(0.12) : 선호도 성격 - 에너지 상관 상대적으로 낮음
         **/
        private static final double[] WEIGHTS_OVERALL = {
                        0.28, // socialLoad
                        0.24, // interactionMode
                        0.20, // activityIntensity
                        0.16, // commitmentLevel
                        0.12 // structureLevel
        };

        /**
         * 2축 사회적 에너지 가중치 (socialLoad + interactionMode)
         * socialLoad가 인원수 기반 부담 → 더 높은 비중
         **/
        private static final double[] WEIGHTS_SOCIAL = {
                        0.55, // socialLoad
                        0.45 // interactionMode
        };

        /**
         * 3축 활동/몰입 스타일 가중치 (activityIntensity + commitmentLevel + structureLevel)
         **/
        private static final double[] WEIGHTS_ACTIVITY = {
                        0.40, // activityIntensity
                        0.35, // commitmentLevel
                        0.25 // structureLevel
        };

        public RecommendationBundleDTO recommend(Long userId, int limit) {

                // 1. 유저 에너지 프로필 조회
                UsersEnergyProfile userProfile = userEnergyProfileRepository.findByUserUserId(userId)
                                .orElseThrow(() -> new IllegalStateException("에너지 프로필이 없습니다. 테스트를 먼저 완료해주세요!"));

                double[] userOverall = toOverallVector(userProfile);
                double[] userSocial = toSocialVector(userProfile);
                double[] userActivity = toActivityVector(userProfile);

                // 2. 모집중인 서클의 에너지 프로필 조회
                List<CircleEnergyProfile> profiles = circleEnergyProfileRepository
                                .findByCircle_Status(CircleStatus.OPEN);

                // 3. 각 기준별 유사도 계산 + 정렬 + limit
                List<RecommendationResponseDTO> overall = profiles.stream()
                                .map(ep -> {
                                        double[] circleVec = toOverallVector(ep);
                                        return new RecommendationResponseDTO(ep.getCircle(),
                                                        weightedEuclideanSimilarity(userOverall, circleVec,
                                                                        WEIGHTS_OVERALL),
                                                        userOverall, circleVec);
                                })
                                .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
                                .limit(limit)
                                .collect(Collectors.toList());

                String overallReaon = null;
                if (!overall.isEmpty()) {
                        try {
                                List<RecommendationResponseDTO> top3 = overall.subList(0, Math.min(3, overall.size()));
                                overallReaon = generateOverallReason(userProfile, top3);
                        } catch (Exception e) {
                                log.warn("LLM 추천 이유 생성 실패: {}", e.getMessage());
                        }
                }

                List<RecommendationResponseDTO> social = profiles.stream()
                                .map(ep -> {
                                        double[] circleVec = toOverallVector(ep);
                                        return new RecommendationResponseDTO(ep.getCircle(),
                                                        weightedEuclideanSimilarity(userSocial, toSocialVector(ep),
                                                                        WEIGHTS_SOCIAL),
                                                        userOverall, circleVec);
                                })
                                .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
                                .limit(limit)
                                .collect(Collectors.toList());

                List<RecommendationResponseDTO> activity = profiles.stream()
                                .map(ep -> {
                                        double[] circleVec = toOverallVector(ep);
                                        return new RecommendationResponseDTO(ep.getCircle(),
                                                        weightedEuclideanSimilarity(userActivity, toActivityVector(ep),
                                                                        WEIGHTS_ACTIVITY),
                                                        userOverall, circleVec);
                                })
                                .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
                                .limit(limit)
                                .collect(Collectors.toList());

                return new RecommendationBundleDTO(overall, social, activity, overallReaon);
        }

        private String generateOverallReason(UsersEnergyProfile user, List<RecommendationResponseDTO> topCircles) {
                StringBuilder circleList = new StringBuilder();
                for (int i = 0; i < topCircles.size(); i++) {
                        RecommendationResponseDTO dto = topCircles.get(i);
                        circleList.append(String.format("%d. %s (%s, 일치도 %d%%)\n",
                                        i + 1, dto.getName(), dto.getCategoryName(),
                                        (int) (dto.getSimilarity() * 100)));
                }

                String prompt = "당신은 모임 추천 전문가입니다.\n"
                                + "사용자의 에너지 프로필을 분석하여, 아래 추천 모임들을 선정한 공통 이유를 한국어로 2~3문장으로 작성하세요.\n"
                                + "개별 모임 설명이 아니라, 이 사용자에게 이런 유형의 모임들이 잘 맞는 이유를 설명해야 합니다.\n\n"
                                + "[사용자 프로필]\n"
                                + "- 사교 범위: " + user.getSocialLoad() + "/5\n"
                                + "- 상호작용 방식: " + user.getInteractionMode() + "/5\n"
                                + "- 활동 강도: " + user.getActivityIntensity() + "/5\n"
                                + "- 참여 부담: " + user.getCommitmentLevel() + "/5\n"
                                + "- 구조감: " + user.getStructureLevel() + "/5\n\n"
                                + "[추천된 모임 목록]\n"
                                + circleList
                                + "\n위 모임들을 이 사용자에게 추천하는 공통 이유를 2~3문장으로만 작성하세요.";

                OpenAiChatOptions options = OpenAiChatOptions.builder()
                                .model("gpt-4o-mini")
                                .temperature(0.7d)
                                .build();

                return chatModel.call(new Prompt(prompt, options))
                                .getResult().getOutput().getText();
        }

        // === 벡터 변환 ===

        // 유저 프로필 → 5축 전체 벡터 [socialLoad, interactionMode, activityIntensity,
        // commitmentLevel, structureLevel]
        private double[] toOverallVector(UsersEnergyProfile p) {
                return new double[] {
                                p.getSocialLoad(),
                                p.getInteractionMode(),
                                p.getActivityIntensity(),
                                p.getCommitmentLevel(),
                                p.getStructureLevel()
                };
        }

        // 서클 → 5축 전체 벡터
        private double[] toOverallVector(CircleEnergyProfile p) {
                return new double[] {
                                p.getSocialLoad(),
                                p.getInteractionMode(),
                                p.getActivityIntensity(),
                                p.getCommitmentLevel(),
                                p.getStructureLevel()
                };
        }

        // 유저 프로필 → 2축 사회적 에너지 벡터 [socialLoad, interactionMode]
        private double[] toSocialVector(UsersEnergyProfile p) {
                return new double[] {
                                p.getSocialLoad(),
                                p.getInteractionMode()
                };
        }

        // 서클 → 2축 사회적 에너지 벡터
        private double[] toSocialVector(CircleEnergyProfile p) {
                return new double[] {
                                p.getSocialLoad(),
                                p.getInteractionMode()
                };
        }

        // 유저 프로필 → 3축 활동/몰입 벡터 [activityIntensity, commitmentLevel, structureLevel]
        private double[] toActivityVector(UsersEnergyProfile p) {
                return new double[] {
                                p.getActivityIntensity(),
                                p.getCommitmentLevel(),
                                p.getStructureLevel()
                };
        }

        // 서클 → 3축 활동/몰입 벡터
        private double[] toActivityVector(CircleEnergyProfile p) {
                return new double[] {
                                p.getActivityIntensity(),
                                p.getCommitmentLevel(),
                                p.getStructureLevel()
                };
        }

        // === 가중 유클리드 유사도(Weighted Euclidean Similarity) ===

        /**
         * 가중 유클리드 유사도: 1 / (1 + √Σ(w_i × (a_i - b_i)²))
         * 각 축에 가중치를 곱해서, 중요한 축의 차이가 유사도에 더 크게 반영됨
         * 결과: 0~1 범위 (1에 가까울수록 유사)
         */
        private double weightedEuclideanSimilarity(double[] a, double[] b, double[] weights) {
                double sum = 0.0;
                for (int i = 0; i < a.length; i++) {
                        double diff = a[i] - b[i];
                        sum += weights[i] * diff * diff;
                }
                return 1.0 / (1.0 + Math.sqrt(sum));
        }

}