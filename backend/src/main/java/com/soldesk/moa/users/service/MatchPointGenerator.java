package com.soldesk.moa.users.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.users.entity.UsersEnergyProfile;

@Component
public class MatchPointGenerator {

    private static final String FALLBACK_MESSAGE = "회원님의 에너지 스타일에 맞춰 추천된 모임이에요";

    /**
     * 축 정보를 담는 내부 클래스
     * - name: 축 이름 (로그/디버그용)
     * - weight: 가중치 (우선순위 정렬용)
     * - diff: 유저-서클 간 차이 (절대값)
     * - avgValue: 유저+서클 평균값 (구간 판단용)
     * - labels: [낮음 표현, 중간 표현, 높음 표현]
     */
    private static class AxisMatch {
        String name;
        double weight;
        int diff;
        double avgValue;
        String[] labels;

        AxisMatch(String name, double weight, int userVal, int circleVal, String[] labels) {
            this.name = name;
            this.weight = weight;
            this.diff = Math.abs(userVal - circleVal);
            this.avgValue = (userVal + circleVal) / 2.0;
            this.labels = labels;
        }

        /**
         * 평균값 기준으로 구간별 표현을 반환
         * 1~2 → 낮음(index 0), 3 → 중간(index 1), 4~5 → 높음(index 2)
         */
        String getLabel() {
            if (avgValue <= 2.0) {
                return labels[0];
            } else if (avgValue <= 3.0) {
                return labels[1];
            } else {
                return labels[2];
            }
        }
    }

    // 축별 표현 매핑 테이블 [낮음, 중간, 높음]
    private static final String[] SOCIAL_LOAD_LABELS = {
            "조용한 분위기", "적당한 규모의 분위기", "활기찬 분위기"
    };
    private static final String[] INTERACTION_MODE_LABELS = {
            "부담 없는 교류 방식", "자연스러운 교류 방식", "적극적인 교류 방식"
    };
    private static final String[] ACTIVITY_INTENSITY_LABELS = {
            "차분한 활동 강도", "적당한 활동 강도", "활발한 활동 강도"
    };
    private static final String[] COMMITMENT_LEVEL_LABELS = {
            "부담 없이 참여할 수 있는 흐름", "꾸준히 이어가기 좋은 흐름", "깊이 있게 참여할 수 있는 흐름"
    };
    private static final String[] STRUCTURE_LEVEL_LABELS = {
            "자유로운 운영 방식", "균형 잡힌 운영 방식", "체계적인 운영 방식"
    };

    /**
     * 유저 프로필과 서클을 비교하여 매치포인트 2개를 생성
     *
     * 1. 5축 각각 차이 계산
     * 2. strongMatch (차이 0~1) / softMatch (차이 2) 분류
     * 3. strong >= 2 → strong 상위 2개
     * strong == 1 → strong 1개 + soft 상위 1개
     * strong == 0, soft >= 1 → soft 상위 1~2개
     * 둘 다 없음 → fallback 문장
     * 4. 선택된 축의 평균값으로 구간별 표현 반환
     */
    public List<String> generate(UsersEnergyProfile userProfile, Circle circle) {

        // 5축 비교 정보 생성 (가중치 순서 동일)
        List<AxisMatch> axes = List.of(
                new AxisMatch("socialLoad", 0.28,
                        userProfile.getSocialLoad(), circle.getSocialLoad(),
                        SOCIAL_LOAD_LABELS),
                new AxisMatch("interactionMode", 0.24,
                        userProfile.getInteractionMode(), circle.getInteractionMode(),
                        INTERACTION_MODE_LABELS),
                new AxisMatch("activityIntensity", 0.20,
                        userProfile.getActivityIntensity(), circle.getActivityIntensity(),
                        ACTIVITY_INTENSITY_LABELS),
                new AxisMatch("commitmentLevel", 0.16,
                        userProfile.getCommitmentLevel(), circle.getCommitmentLevel(),
                        COMMITMENT_LEVEL_LABELS),
                new AxisMatch("structureLevel", 0.12,
                        userProfile.getStructureLevel(), circle.getStructureLevel(),
                        STRUCTURE_LEVEL_LABELS));

        // strong (차이 0~1) / soft (차이 2) 분류, 가중치 내림차순 정렬
        List<AxisMatch> strongMatches = axes.stream()
                .filter(a -> a.diff <= 1)
                .sorted(Comparator.comparingDouble((AxisMatch a) -> a.weight).reversed())
                .toList();

        List<AxisMatch> softMatches = axes.stream()
                .filter(a -> a.diff == 2)
                .sorted(Comparator.comparingDouble((AxisMatch a) -> a.weight).reversed())
                .toList();

        // 매치포인트 선택
        List<AxisMatch> selected = new ArrayList<>();

        if (strongMatches.size() >= 2) {
            selected.add(strongMatches.get(0));
            selected.add(strongMatches.get(1));
        } else if (strongMatches.size() == 1) {
            selected.add(strongMatches.get(0));
            if (!softMatches.isEmpty()) {
                selected.add(softMatches.get(0));
            }
        } else {
            // strong 없음 → soft에서 최대 2개
            for (int i = 0; i < Math.min(2, softMatches.size()); i++) {
                selected.add(softMatches.get(i));
            }
        }

        // 결과 변환
        if (selected.isEmpty()) {
            return List.of(FALLBACK_MESSAGE);
        }

        return selected.stream()
                .map(AxisMatch::getLabel)
                .toList();
    }

    /**
     * 매치포인트를 프롬프트용 문자열로 변환
     * 예: "- 조용한 분위기\n- 부담 없는 교류 방식"
     */
    public String toPromptString(List<String> matchPoints) {
        if (matchPoints.size() == 1 && matchPoints.get(0).equals(FALLBACK_MESSAGE)) {
            return FALLBACK_MESSAGE;
        }

        StringBuilder sb = new StringBuilder();
        for (String point : matchPoints) {
            sb.append("- ").append(point).append("\n");
        }
        return sb.toString().trim();
    }
}