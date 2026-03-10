package com.soldesk.moa.circle.repository;

import java.util.List;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
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
            return null; // 기본은 상태 조건 없음
        }

        // type=OPEN 일 때만 모집중 필터
        if ("OPEN".equalsIgnoreCase(type)) {
            return QCircle.circle.status.eq(
                    com.soldesk.moa.circle.entity.constant.CircleStatus.OPEN);
        }

        return null;
    }
}