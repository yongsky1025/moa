package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
import com.soldesk.moa.circle.entity.QCircleMember;
import com.soldesk.moa.users.entity.QUsers;

public class SearchCircleMemberRepositoryImpl extends QuerydslRepositorySupport
                implements SearchCircleMemberRepository {

        public SearchCircleMemberRepositoryImpl() {
                super(CircleMember.class);
        }

        @Override
        public List<Object[]> getAgeCategoryRetention() {

                QCircleMember circleMember = QCircleMember.circleMember;
                QUsers user = QUsers.users;
                QCircle circle = QCircle.circle;
                QCircleCategory category = QCircleCategory.circleCategory;

                StringExpression ageGroup = new CaseBuilder()
                                .when(user.age.between(10, 19)).then("10대")
                                .when(user.age.between(20, 29)).then("20대")
                                .when(user.age.between(30, 39)).then("30대")
                                .when(user.age.between(40, 49)).then("40대")
                                .otherwise("50대 이상");

                LocalDateTime threeMonths = LocalDateTime.now().minusMonths(3L);

                NumberExpression<Long> retainedUser = new CaseBuilder()
                                .when(circleMember.createDate.loe(threeMonths))
                                .then(user.userId)
                                .otherwise((Long) null)
                                .countDistinct();

                JPQLQuery<CircleMember> query = from(circleMember).join(circleMember.user, user)
                                .join(circleMember.circle, circle).join(circle.category, category);
                JPQLQuery<Tuple> tuple = query.select(ageGroup, category.categoryName, user.userId.countDistinct(),
                                retainedUser);

                tuple.groupBy(user.age, category.categoryName);
                tuple.orderBy(ageGroup.asc());

                List<Tuple> result = tuple.fetch();

                return result.stream().map(Tuple::toArray).collect(Collectors.toList());
        }

}
