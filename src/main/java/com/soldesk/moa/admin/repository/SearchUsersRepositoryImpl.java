package com.soldesk.moa.admin.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Query;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.admin.dto.AdminUserResponseDTO;
import com.soldesk.moa.admin.dto.AdminUserSearchDTO;
import com.soldesk.moa.admin.temporary.QReply;
import com.soldesk.moa.board.entity.QPost;
import com.soldesk.moa.circle.entity.QCircleMember;
import com.soldesk.moa.users.entity.QUsers;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class SearchUsersRepositoryImpl extends QuerydslRepositorySupport
        implements SearchUsersRepository {

    public SearchUsersRepositoryImpl() {
        super(Users.class);
    }

    @Override
    public List<Object[]> getCountCreateUserByDate() {
        QUsers user = QUsers.users;

        JPQLQuery<Users> query = from(user);

        JPQLQuery<Tuple> tuple = query.select(user.createDate.year(),
                user.createDate.month(), user.count());

        tuple.groupBy(user.createDate.year(), user.createDate.month());
        tuple.orderBy(user.createDate.year().desc(), user.createDate.month().desc());

        List<Tuple> result = tuple.fetch();
        List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

        return list;
    }

    @Override
    public List<Object[]> getAgeGroup() {
        QUsers user = QUsers.users;

        JPQLQuery<Users> query = from(user).where(user.userStatus.eq(UserStatus.ACTIVE));
        // floor(u.age / 10) * 10을 querydsl 객체로 변환
        // user.age.divide(10).floor().multiply(10);
        // ONLY_FULL_GROUP_BY 오류로 인해 numberTemplate 메소드로 직접 쿼리문 작성
        NumberExpression<Integer> ageGroup = Expressions.numberTemplate(Integer.class, "floor({0}/10)*10", user.age);

        // count(case when ~ then 1 end)를 dsl로 구현, count는 불가해서 sum 사용
        NumberExpression<Integer> countMale = new CaseBuilder().when(user.userGender.eq(UserGender.MALE)).then(1)
                .otherwise(0).sum();
        NumberExpression<Integer> countFemale = new CaseBuilder().when(user.userGender.eq(UserGender.FEMALE)).then(1)
                .otherwise(0).sum();

        JPQLQuery<Tuple> tuple = query.select(ageGroup, user.count(), countMale,
                countFemale);

        tuple.groupBy(ageGroup);

        // age_group으로 정렬하기
        tuple.orderBy(ageGroup.asc());

        List<Tuple> result = tuple.fetch();

        return result.stream().map(Tuple::toArray).collect(Collectors.toList());
    }

    @Override
    public Long getSignUpCount(LocalDateTime start, LocalDateTime end) {

        QUsers user = QUsers.users;
        JPQLQuery<Users> query = from(user).where(user.createDate.between(start,
                end));

        JPQLQuery<Long> result = query.select(user.userId);

        return result.fetchCount();
    }

    @Override
    public Page<Users> getUsersInfo(Pageable pageable, AdminUserSearchDTO searchDTO) {
        log.info("전체 유저 조회");
        QUsers users = QUsers.users;

        JPQLQuery<Users> query = from(users).select(users);

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(users.userId.gt(0));
        // where(조건 필터링)

        if (searchDTO.getGender() != null) {
            builder.and(users.userGender.eq(searchDTO.getGender()));
        }
        if (searchDTO.getRole() != null) {
            builder.and(users.userRole.eq(searchDTO.getRole()));
        }
        if (searchDTO.getStatus() != null) {
            builder.and(users.userStatus.eq(searchDTO.getStatus()));
        }

        // where(특정 유저 검색)
        // type => id == i , name = n, status = s, age = a, gender = g, role = r, birth
        // = b, phone = p

        if (searchDTO.getType() != null) {
            String[] typeArr = searchDTO.getType().split("");
            for (String t : typeArr) {
                switch (t) {
                    case "i":
                        long userId = Long.parseLong(searchDTO.getKeyword());
                        builder.and(users.userId.eq(userId));
                        break;
                    case "n":
                        builder.and(users.name.contains(searchDTO.getKeyword()));
                        break;
                    case "a":
                        int age = Integer.parseInt(searchDTO.getKeyword());
                        builder.and(users.age.eq(age));
                        break;
                    // 생년월일 8자리로 받겠음
                    case "b":
                        LocalDate birth = LocalDate.parse(searchDTO.getKeyword());
                        builder.and(users.birthDate.eq(birth));
                        break;
                    // 핸드폰 번호 : - 기호 없이
                    case "p":
                        builder.and(users.phone.contains(searchDTO.getKeyword()));
                        break;
                }
            }
        }

        query.where(builder);

        // order by
        Sort sort = pageable.getSort();
        sort.stream().forEach(order -> {
            Order direction = order.isAscending() ? Order.ASC : Order.DESC;

            String prop = order.getProperty();
            PathBuilder orderByExpression = new PathBuilder<>(Users.class, "users");
            query.orderBy(new OrderSpecifier(direction, orderByExpression.get(prop)));
        });

        query.offset(pageable.getOffset());
        query.limit(pageable.getPageSize());

        log.info(query);

        List<Users> list = query.fetch();

        long count = query.fetchCount();

        return new PageImpl<>(list, pageable, count);
    }

    @Override
    public Object[] getUserProfile(Long userId) {
        QUsers user = QUsers.users;
        QPost post = QPost.post;
        QReply reply = QReply.reply;
        QCircleMember circleMember = QCircleMember.circleMember;

        JPQLQuery<Users> query = from(user)
                .leftJoin(post).on(post.userId.eq(user))
                .leftJoin(reply).on(reply.user.eq(user))
                .leftJoin(circleMember).on(circleMember.user.eq(user))
                .where(user.userId.eq(userId));

        JPQLQuery<Tuple> tuple = query.select(user, post.userId.count(), reply.user.count(), circleMember.user.count());

        tuple.groupBy(user);

        Tuple result = tuple.fetchFirst();

        return result.toArray();
    }

}
