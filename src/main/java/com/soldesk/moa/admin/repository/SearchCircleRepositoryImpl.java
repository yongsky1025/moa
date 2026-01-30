package com.soldesk.moa.admin.repository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.admin.dto.AdminCircleSearchDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
import com.soldesk.moa.circle.entity.QCircleMember;
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

}
