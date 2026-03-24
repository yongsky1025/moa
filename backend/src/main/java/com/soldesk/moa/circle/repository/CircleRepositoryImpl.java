package com.soldesk.moa.circle.repository;

import java.util.List;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
import com.soldesk.moa.circle.entity.QCircleEnergyProfile;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import jakarta.persistence.EntityManager;

public class CircleRepositoryImpl implements CircleRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public CircleRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public PageResultDTO<Circle> findByCategories(
            List<Long> categoryIds,
            PageRequestDTO pageRequestDTO) {

        QCircle circle = QCircle.circle;
        QCircleCategory category = QCircleCategory.circleCategory;

        int page = pageRequestDTO.getPage() - 1;
        int size = pageRequestDTO.getSize();

        //
        // content query
        List<Circle> content = queryFactory
                .selectFrom(circle)
                .join(circle.category, category).fetchJoin()
                .where(
                        categoryIn(categoryIds),
                        keywordContains(pageRequestDTO.getKeyword()),
                        statusFilter(pageRequestDTO.getType()))
                .offset((long) page * size)
                .limit(size)
                .fetch();

        //
        // count query
        Long total = queryFactory
                .select(circle.count())
                .from(circle)
                .where(
                        categoryIn(categoryIds),
                        keywordContains(pageRequestDTO.getKeyword()),
                        statusFilter(pageRequestDTO.getType()))
                .fetchOne();

        return PageResultDTO.<Circle>withAll()
                .dtoList(content)
                .pageRequestDTO(pageRequestDTO)
                .totalCount(total == null ? 0 : total)
                .build();
    }

    @Override
    public List<Circle> findRecommended(
            int socialLoad,
            int interactionMode,
            int structureLevel,
            int activityIntensity,
            int commitmentLevel) {

        QCircle circle = QCircle.circle;
        QCircleEnergyProfile ep = QCircleEnergyProfile.circleEnergyProfile;

        /**
        * 축별 가중치(에너지 소모 영향도 순, 0.04 등차, 합계
        * 1) socialLoad(0.28) : 인원수 = 사회적 정보 처리량 - 에너지 소모에 가장 큰 영향
        * 2) interactionMode(0.24) : 소통 깊이 - 인지적 에너지 소모에 직결
        * 3) activityIntensity(0.20) : 신체적 에너지 - 활동 강도
        * 4) commitmentLevel(0.16) : 심리적 부담 - 지속성/몰입 부담
        * 5) structureLevel(0.12) : 선호도 성격 - 에너지 상관 상대적으로 낮음
        **/
        // 가중치 적용 유클리드 거리의 제곱으로 정렬 (socialLoad 0.28, interactionMode 0.24, structureLevel 0.20, activityIntensity 0.16, commitmentLevel 0.12)
        NumberExpression<Double> weightedDistanceSq =
                ep.socialLoad.subtract(socialLoad).multiply(ep.socialLoad.subtract(socialLoad)).doubleValue().multiply(0.28)
                .add(ep.interactionMode.subtract(interactionMode).multiply(ep.interactionMode.subtract(interactionMode)).doubleValue().multiply(0.24))
                .add(ep.structureLevel.subtract(structureLevel).multiply(ep.structureLevel.subtract(structureLevel)).doubleValue().multiply(0.20))
                .add(ep.activityIntensity.subtract(activityIntensity).multiply(ep.activityIntensity.subtract(activityIntensity)).doubleValue().multiply(0.16))
                .add(ep.commitmentLevel.subtract(commitmentLevel).multiply(ep.commitmentLevel.subtract(commitmentLevel)).doubleValue().multiply(0.12));

        return queryFactory
                .selectFrom(circle)
                .join(ep).on(ep.circle.eq(circle))
                .where(circle.status.notIn(CircleStatus.PENDING, CircleStatus.REJECTED, CircleStatus.CLOSED))
                .orderBy(weightedDistanceSq.asc())
                .limit(10)
                .fetch();
    }

    //
    // 조건 메서드들
    private BooleanExpression categoryIn(List<Long> categoryIds) {
        return (categoryIds == null || categoryIds.isEmpty()) ? null
                : QCircleCategory.circleCategory.categoryId.in(categoryIds);
    }

    private BooleanExpression keywordContains(String keyword) {
        return keyword == null || keyword.isBlank() ? null
                : QCircle.circle.name.contains(keyword);
    }

    // 서클이 모집중일까 아닐까??
    private BooleanExpression statusFilter(String type) {
        if (type == null || type.isBlank()) {
            // 기본: PENDING, REJECTED 제외 (승인된 서클만 공개)
            return QCircle.circle.status.notIn(CircleStatus.PENDING, CircleStatus.REJECTED, CircleStatus.CLOSED);
        }

        // type=OPEN 일 때만 모집중 필터
        if ("OPEN".equalsIgnoreCase(type)) {
            return QCircle.circle.status.eq(CircleStatus.OPEN);
        }

        return null;
    }
}