package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Sort;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleSearchDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
import com.soldesk.moa.circle.entity.QCircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.board.entity.QBoard;
import com.soldesk.moa.post.entity.QPost;
import com.soldesk.moa.reply.entity.QReply;
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
                                .join(circleCategory).on(circle.category.eq(circleCategory));

                // subquery
                JPQLQuery<String> circleMemberSubQuery = JPAExpressions.select(circleMember.user.name)
                                .from(circleMember)
                                .where(circleMember.circle.eq(circle).and(circleMember.role.eq(CircleRole.LEADER)));

                JPQLQuery<Tuple> tuple = query.select(circle.circleId, circleCategory.categoryName, circle.name,
                                circleMemberSubQuery, circle.currentMember, circle.maxMember, circle.status);

                BooleanBuilder builder = new BooleanBuilder();

                // 필터링
                if (adminCircleSearchDTO.getStatus() != null) {
                        builder.and(circle.status.eq(adminCircleSearchDTO.getStatus()));
                }
                if (adminCircleSearchDTO.getCategoryName() != null) {
                        builder.and(circle.category.categoryName.eq(adminCircleSearchDTO.getCategoryName()));
                }

                // 조건 검색
                // type => id , name , leader

                if (adminCircleSearchDTO.getKeyword() != null && !adminCircleSearchDTO.getKeyword().isEmpty()) {

                        switch (adminCircleSearchDTO.getType()) {
                                case "id":
                                        builder.and(circle.circleId
                                                        .eq(Long.parseLong(adminCircleSearchDTO.getKeyword())));
                                        break;
                                case "name":
                                        builder.and(circle.name.contains(adminCircleSearchDTO.getKeyword()));
                                        break;
                                case "leader":
                                        builder.and(circleMemberSubQuery.contains(adminCircleSearchDTO.getKeyword()));
                                        break;
                        }
                }

                tuple.where(builder);

                Sort sortSpec = pageable.getSort();
                if (sortSpec.isSorted()) {
                        for (Sort.Order order : sortSpec) {
                                Order dir = order.isAscending() ? Order.ASC : Order.DESC;
                                switch (order.getProperty()) {
                                        case "name"          -> tuple.orderBy(new OrderSpecifier<>(dir, circle.name));
                                        case "currentMember" -> tuple.orderBy(new OrderSpecifier<>(dir, circle.currentMember));
                                        case "createDate"    -> tuple.orderBy(new OrderSpecifier<>(dir, circle.createDate));
                                        default              -> tuple.orderBy(new OrderSpecifier<>(dir, circle.circleId));
                                }
                        }
                } else {
                        tuple.orderBy(circle.circleId.desc());
                }

                tuple.offset(pageable.getOffset());
                tuple.limit(pageable.getPageSize());

                log.info(query);

                List<Tuple> result = tuple.fetch();
                List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

                // count query 분리
                long count = from(circle)
                                .join(circleCategory).on(circle.category.eq(circleCategory))
                                .where(builder)
                                .select(circle.count())
                                .fetchOne();

                return new PageImpl<>(list, pageable, count);
        }

        // 인기모임
        @Override
        public List<Object[]> findPopularCircles(LocalDateTime since, int limit) {

                QCircle circle = QCircle.circle;
                QCircleMember circleMember = QCircleMember.circleMember;
                QSchedule schedule = QSchedule.schedule;
                QCircleCategory category = QCircleCategory.circleCategory;

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

                JPQLQuery<Circle> query = from(circle).join(category).on(circle.category.eq(category));

                JPQLQuery<Tuple> tuple = query.select(circle.circleId, circle.name, category.categoryName,
                                circle.currentMember,
                                score);

                tuple.groupBy(circle.circleId);
                tuple.orderBy(score.desc());
                tuple.limit(limit);

                List<Tuple> result = tuple.fetch();

                return result.stream().map(Tuple::toArray).collect(Collectors.toList());
        }

        @Override
        public Long countTotalCircle() {
                QCircle circle = QCircle.circle;

                JPAQueryFactory queryFactory = new JPAQueryFactory(getEntityManager());

                return queryFactory.select(circle.count())
                                .from(circle)
                                .where(circle.status.eq(CircleStatus.OPEN).or(circle.status.eq(CircleStatus.FULL)))
                                .fetchOne();
        }

        @Override
        public Long countInactiveMatureCircle(LocalDateTime maturityThreshold, LocalDateTime activityThreshold) {
                QCircle circle = QCircle.circle;
                QSchedule schedule = QSchedule.schedule;

                JPAQueryFactory queryFactory = new JPAQueryFactory(getEntityManager());

                // OPEN/FULL 상태인 성숙 모임(생성 30일 이상) 중 최근 30일 내 일정이 하나도 없는 모임
                return queryFactory.select(circle.count())
                                .from(circle)
                                .where(circle.status.eq(CircleStatus.OPEN).or(circle.status.eq(CircleStatus.FULL))
                                                .and(circle.createDate.lt(maturityThreshold))
                                                .and(JPAExpressions.selectOne()
                                                                .from(schedule)
                                                                .where(schedule.circle.eq(circle)
                                                                                .and(schedule.startAt.goe(
                                                                                                activityThreshold)))
                                                                .notExists()))
                                .fetchOne();
        }

        @Override
        public List<Object[]> findCircleCreateActivity(LocalDateTime since) {

                QCircle circle = QCircle.circle;

                NumberExpression<Integer> hour = Expressions.numberTemplate(Integer.class, "hour({0})",
                                circle.createDate);

                NumberExpression<Integer> day = Expressions.numberTemplate(Integer.class, "dayofweek({0})",
                                circle.createDate);

                JPQLQuery<Circle> query = from(circle).where(circle.createDate.goe(since));

                JPQLQuery<Tuple> tuple = query.select(day, hour, circle.count());

                tuple.groupBy(day, hour);
                List<Tuple> list = tuple.fetch();

                return list.stream().map(Tuple::toArray).collect(Collectors.toList());
        }

        // 모임 상세 조회 (circle + category + leader + coverImage + totalPosts)
        @Override
        public Object[] getCircleDetail(Long circleId) {
                QCircle circle = QCircle.circle;
                QCircleCategory category = QCircleCategory.circleCategory;
                QCircleMember circleMember = QCircleMember.circleMember;
                QBoard board = QBoard.board;
                QPost post = QPost.post;

                // 리더 이름 서브쿼리
                JPQLQuery<String> leaderNameSub = JPAExpressions.select(circleMember.user.name)
                                .from(circleMember)
                                .where(circleMember.circle.eq(circle)
                                                .and(circleMember.role.eq(CircleRole.LEADER)));

                // 리더 userId 서브쿼리
                JPQLQuery<Long> leaderIdSub = JPAExpressions.select(circleMember.user.userId)
                                .from(circleMember)
                                .where(circleMember.circle.eq(circle)
                                                .and(circleMember.role.eq(CircleRole.LEADER)));

                // 게시글 수 서브쿼리
                JPQLQuery<Long> postCountSub = JPAExpressions.select(post.count())
                                .from(post)
                                .join(post.boardId, board)
                                .where(board.circleId.eq(circle)
                                                .and(post.deleted.eq(false)));

                Tuple result = from(circle)
                                .join(category).on(circle.category.eq(category))
                                .where(circle.circleId.eq(circleId))
                                .select(circle, category.categoryName, leaderNameSub, leaderIdSub, postCountSub)
                                .fetchOne();

                if (result == null) {
                        return null;
                }
                return result.toArray();
        }

        // 모임 가입 회원 목록
        @Override
        public Page<Object[]> getCircleMembers(Long circleId, Pageable pageable) {
                QCircleMember circleMember = QCircleMember.circleMember;
                QUsers user = QUsers.users;

                JPQLQuery<Tuple> tuple = from(circleMember)
                                .join(circleMember.user, user)
                                .where(circleMember.circle.circleId.eq(circleId)
                                                .and(circleMember.status.notIn(
                                                                CircleMemberStatus.LEFT,
                                                                CircleMemberStatus.KICKED,
                                                                CircleMemberStatus.REJECTED)))
                                .select(user.userId, user.name, user.userGender, circleMember.role,
                                                circleMember.status, circleMember.createDate);

                tuple.orderBy(circleMember.role.asc(), circleMember.createDate.asc());
                long count = tuple.fetchCount();

                tuple.offset(pageable.getOffset());
                tuple.limit(pageable.getPageSize());

                List<Tuple> result = tuple.fetch();
                List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

                return new PageImpl<>(list, pageable, count);
        }

        // 모임 최근 게시물
        @Override
        public Page<Object[]> getCirclePosts(Long circleId, Pageable pageable) {
                QPost post = QPost.post;
                QBoard board = QBoard.board;
                QUsers user = QUsers.users;
                QReply reply = QReply.reply;

                JPQLQuery<Tuple> tuple = from(post)
                                .join(post.boardId, board)
                                .join(post.userId, user)
                                .leftJoin(reply).on(reply.postId.eq(post).and(reply.deleted.eq(false)))
                                .where(board.circleId.circleId.eq(circleId)
                                                .and(post.deleted.eq(false)))
                                .groupBy(post.postId)
                                .select(post.postId, post.title, user.name, post.viewCount, reply.count(),
                                                post.createDate);

                tuple.orderBy(post.createDate.desc());
                long count = tuple.fetchCount();

                tuple.offset(pageable.getOffset());
                tuple.limit(pageable.getPageSize());

                List<Tuple> result = tuple.fetch();
                List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

                return new PageImpl<>(list, pageable, count);
        }

}
