package com.soldesk.moa.admin.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.admin.dto.AdminCircleSearchDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
import com.soldesk.moa.circle.entity.QCircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.schedule.entity.QSchedule;
import com.soldesk.moa.users.entity.QUsers;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class SearchCircleRepositoryImpl extends QuerydslRepositorySupport
        implements SearchCircleRepository {

    public SearchCircleRepositoryImpl() {
        super(Circle.class);
    }

    @Override
    public Page<Object[]> getJoinCircleByUserId(Long userId, Pageable pageable) {
        QUsers user = QUsers.users;
        QCircleMember circleMember = QCircleMember.circleMember;
        QCircle circle = QCircle.circle;
        QCircleCategory category = QCircleCategory.circleCategory;

        JPQLQuery<Circle> query = from(circle)
                .leftJoin(circleMember).on(circleMember.circle.eq(circle))
                .leftJoin(user).on(circleMember.user.eq(user))
                .leftJoin(category).on(circle.category.eq(category))
                .where(user.userId.eq(userId));

        JPQLQuery<Tuple> tuple = query.select(circle, user.name,
                category.categoryName, circleMember);

        tuple.orderBy(circle.circleId.asc());

        tuple.offset(pageable.getOffset());
        tuple.limit(pageable.getPageSize());

        log.info(query);

        List<Tuple> result = tuple.fetch();
        long count = tuple.fetchCount();

        List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

        return new PageImpl<>(list, pageable, count);
    }

    @Override
    public Page<Object[]> getCircleInfo(Pageable pageable, AdminCircleSearchDTO adminCircleSearchDTO) {
        QCircle circle = QCircle.circle;
        QCircleCategory circleCategory = QCircleCategory.circleCategory;
        QCircleMember circleMember = QCircleMember.circleMember;

        JPQLQuery<Circle> query = from(circle)
                .join(circleCategory).on(circle.category.eq(circleCategory))
                .leftJoin(circleMember).on(circleMember.circle.eq(circle));

        JPQLQuery<Tuple> tuple = query.select(circle, circleCategory.categoryName,
                circleMember.user.name);

        BooleanBuilder builder = new BooleanBuilder();

        // 필터링
        if (adminCircleSearchDTO.getStatus() != null) {
            builder.and(circle.status.eq(adminCircleSearchDTO.getStatus()));
        }
        if (adminCircleSearchDTO.getCategoryName() != null) {
            builder.and(circle.category.categoryName.eq(adminCircleSearchDTO.getCategoryName()));
        }

        // 조건 검색
        // type => id == i, name == n, leader == l
        if (adminCircleSearchDTO.getType() != null) {
            String[] typeArr = adminCircleSearchDTO.getType().split("");
            for (String t : typeArr) {
                switch (t) {
                    case "i":
                        long circleId = Long.parseLong(adminCircleSearchDTO.getKeyword());
                        builder.and(circle.circleId.eq(circleId));
                        break;
                    case "n":
                        builder.and(circle.name.eq(adminCircleSearchDTO.getKeyword()));
                        break;
                    case "l":
                        builder.and(circleMember.user.name.eq(adminCircleSearchDTO.getKeyword()));
                        break;

                }
            }
        }

        tuple.where(builder);
        tuple.orderBy(circle.circleId.asc());

        tuple.offset(pageable.getOffset());
        tuple.limit(pageable.getPageSize());

        log.info(query);

        List<Tuple> result = tuple.fetch();
        long count = tuple.fetchCount();
        List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

        return new PageImpl<>(list, pageable, count);
    }

    // 인기모임
    @Override
    public List<Circle> findPopularCircles(LocalDateTime since, int limit) {

        QCircle circle = QCircle.circle;
        QCircleMember circleMember = QCircleMember.circleMember;
        QSchedule schedule = QSchedule.schedule;

        // 최근 가입자 수
        NumberExpression<Long> recentJoinCount = Expressions.numberTemplate(Long.class, "{0}",
                JPAExpressions.select(circleMember.count())
                        .from(circleMember)
                        .where(circleMember.circle.eq(circle)
                                .and(circleMember.status.eq(CircleMemberStatus.ACTIVE))
                                .and(circleMember.createDate.goe(since))));

        // 일정 수
        NumberExpression<Long> scheduleCount = Expressions.numberTemplate(Long.class,
                "({0})",
                JPAExpressions
                        .select(schedule.count())
                        .from(schedule)
                        .where(schedule.circle.eq(circle)));

        // 점수 계산
        NumberExpression<Double> score = circle.currentMember.doubleValue().multiply(0.5)
                .add(recentJoinCount.doubleValue().multiply(0.2))
                .add(scheduleCount.doubleValue().multiply(0.3));

        JPQLQuery<Circle> query = from(circle);

        query.select(circle);

        query.groupBy(circle.circleId);
        query.orderBy(score.desc());
        query.limit(limit);

        List<Circle> result = query.fetch();

        return result;
    }

    @Override
    public Long countTotalCircle() {
        QCircle circle = QCircle.circle;

        JPAQueryFactory queryFactory = new JPAQueryFactory(getEntityManager());

        return queryFactory.select(circle.count())
                .from(circle)
                .fetchOne();
    }

    @Override
    public Long countActiveCircle(LocalDateTime since) {
        QCircle circle = QCircle.circle;
        QSchedule schedule = QSchedule.schedule;

        JPAQueryFactory queryFactory = new JPAQueryFactory(getEntityManager());

        return queryFactory.select(circle.countDistinct())
                .from(circle)
                .leftJoin(schedule).on(schedule.circle.eq(circle).and(schedule.startAt.goe(since)))
                .where(schedule.scheduleId.isNotNull())
                .fetchOne();
    }

}
