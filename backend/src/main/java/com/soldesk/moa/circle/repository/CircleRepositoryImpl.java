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
    public PageResultDTO<Circle> findByCategory_CategoryId(
            Long categoryId,
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
                        categoryEq(categoryId),
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
                        categoryEq(categoryId),
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

        // sqrt 없이 거리의 제곱으로 정렬 (단조 증가라 결과 동일)
        NumberExpression<Integer> distanceSq =
                ep.socialLoad.subtract(socialLoad).multiply(ep.socialLoad.subtract(socialLoad))
                .add(ep.interactionMode.subtract(interactionMode).multiply(ep.interactionMode.subtract(interactionMode)))
                .add(ep.structureLevel.subtract(structureLevel).multiply(ep.structureLevel.subtract(structureLevel)))
                .add(ep.activityIntensity.subtract(activityIntensity).multiply(ep.activityIntensity.subtract(activityIntensity)))
                .add(ep.commitmentLevel.subtract(commitmentLevel).multiply(ep.commitmentLevel.subtract(commitmentLevel)));

        return queryFactory
                .selectFrom(circle)
                .join(ep).on(ep.circle.eq(circle))
                .where(circle.status.notIn(CircleStatus.PENDING, CircleStatus.REJECTED, CircleStatus.CLOSED))
                .orderBy(distanceSq.asc())
                .limit(10)
                .fetch();
    }

    //
    // 조건 메서드들

    private BooleanExpression categoryEq(Long categoryId) {
        return categoryId == null ? null
                : QCircle.circle.category.categoryId.eq(categoryId);
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