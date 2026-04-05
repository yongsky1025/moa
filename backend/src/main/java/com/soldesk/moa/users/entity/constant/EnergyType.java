package com.soldesk.moa.users.entity.constant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 에너지 타입 분류
 * 
 * 상위 3축(socialLoad, interactionMode, activityIntensity)의 대표 벡터를 기반으로
 * 유저의 에너지 프로필과 유클리드 거리를 계산하여 가장 가까운 타입으로 매칭
 * 
 * 대표 벡터값: 낮음 = 1.5, 높음 = 4.0
 */
@Getter
@RequiredArgsConstructor
public enum EnergyType {

        QUIET_IMMERSION(
                        "고요한 몰입형",
                        "혼자만의 리듬을 유지하며 조용히 몰입할 수 있는 분위기에서 편안함을 느끼는 타입",
                        "독서모임, 전시·문화 모임, 조용한 클래스",
                        1.5, 1.5, 1.5),

        LIGHT_STROLL(
                        "가벼운 산책형",
                        "부담 없는 움직임과 느슨한 참여 속에서 자연스럽게 에너지를 쓰는 타입",
                        "산책모임, 가벼운 야외활동, 소규모 액티비티",
                        1.5, 1.5, 4.0),

        CALM_EXCHANGE(
                        "조용한 교류형",
                        "많은 사람보다 소수와의 깊이 있는 대화와 차분한 교류를 선호하는 타입",
                        "카페토크, 북토크, 소규모 취향모임",
                        1.5, 4.0, 1.5),

        SMALL_ACTION(
                        "소규모 액션형",
                        "가까운 사람들과 함께 움직이고 교류할 때 가장 자연스럽게 활력이 생기는 타입",
                        "소규모 등산, 원데이 체험, 가벼운 스포츠 모임",
                        1.5, 4.0, 4.0),

        GENTLE_OBSERVER(
                        "잔잔한 관람형",
                        "많은 사람과 같은 공간에 있어도 직접적인 교류보다 조용히 즐기는 방식이 편한 타입",
                        "영화모임, 공연·전시 관람, 문화 이벤트",
                        4.0, 1.5, 1.5),

        PACE_COMPANION(
                        "페이스 동행형",
                        "함께 움직이지만 과한 교류 없이 각자의 페이스를 지키는 흐름에서 편안함을 느끼는 타입",
                        "러닝모임, 워킹크루, 자유 참여형 액티비티",
                        4.0, 1.5, 4.0),

        STRUCTURED_EXCHANGE(
                        "구조적 교류형",
                        "여러 사람과 함께하더라도 체계적인 흐름과 분명한 목적이 있을 때 안정감을 느끼는 타입",
                        "스터디, 세미나, 정기 토론 모임",
                        4.0, 4.0, 1.5),

        ENERGY_SPREADER(
                        "에너지 확산형",
                        "많은 사람과 활발하게 움직이며 에너지를 주고받는 상황에서 만족도가 높아지는 타입",
                        "스포츠 모임, 단체 액티비티, 활발한 커뮤니티",
                        4.0, 4.0, 4.0);

        private final String typeName;
        private final String description;
        private final String recommendedCategories;
        private final double socialLoadCenter;
        private final double interactionModeCenter;
        private final double activityIntensityCenter;

        /**
         * 유저의 3축 스코어와 유클리드 거리 계산
         */
        public double distanceTo(int socialLoad, int interactionMode, int activityIntensity) {
                double ds = socialLoad - this.socialLoadCenter;
                double di = interactionMode - this.interactionModeCenter;
                double da = activityIntensity - this.activityIntensityCenter;
                return Math.sqrt(ds * ds + di * di + da * da);
        }

        /**
         * 8개 타입 중 유저 스코어와 가장 가까운 타입 반환
         */
        public static EnergyType classify(int socialLoad, int interactionMode, int activityIntensity) {
                EnergyType closest = null;
                double minDistance = Double.MAX_VALUE;

                for (EnergyType type : values()) {
                        double distance = type.distanceTo(socialLoad, interactionMode, activityIntensity);
                        if (distance < minDistance) {
                                minDistance = distance;
                                closest = type;
                        }
                }

                return closest;
        }
}