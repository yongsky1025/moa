package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.StringTemplate;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.JPQLQueryFactory;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.board.entity.QBoard;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.entity.QPost;
import com.soldesk.moa.reply.entity.QReply;
import com.soldesk.moa.users.entity.QUsers;

import jakarta.persistence.EntityManager;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class SearchPostRepositoryImpl extends QuerydslRepositorySupport
        implements SearchPostRepository {

    public SearchPostRepositoryImpl() {
        super(Post.class);
    }

    @Override
    public Page<Object[]> searchBoardListByUserId(Long userId, Pageable pageable) {
        QUsers user = QUsers.users;
        QPost post = QPost.post;
        QBoard board = QBoard.board;
        QReply reply = QReply.reply;

        JPQLQuery<Post> query = from(post)
                .leftJoin(post.userId, user)
                .leftJoin(reply).on(reply.postId.eq(post))
                .leftJoin(board).on(post.boardId.eq(board))
                .where(user.userId.eq(userId));

        JPQLQuery<Tuple> tuple = query.select(board.name, post, reply.count());

        tuple.orderBy(post.postId.desc());
        tuple.groupBy(post);

        // page
        tuple.offset(pageable.getOffset());
        tuple.limit(pageable.getPageSize());

        log.info(query);

        List<Tuple> result = tuple.fetch();
        long count = tuple.fetchCount();

        List<Object[]> list = result.stream().map(Tuple::toArray).collect(Collectors.toList());

        return new PageImpl<>(list, pageable, count);
    }

    @Override
    public List<Tuple> countPostsGroupedByDay(LocalDate from) {
        QPost post = QPost.post;

        LocalDateTime fromDt = from.atStartOfDay();

        EntityManager em = getEntityManager();
        JPQLQueryFactory queryFactory = new JPAQueryFactory(em);

        StringTemplate dateExpr = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m-%d')", post.createDate);

        return queryFactory
                .select(dateExpr, post.postId.count())
                .from(post)
                .where(post.createDate.goe(fromDt))
                .groupBy(dateExpr)
                .orderBy(dateExpr.asc())
                .fetch();
    }

    @Override
    public List<Object[]> findPostActivity(LocalDateTime since) {
        QPost post = QPost.post;

        NumberExpression<Integer> day = Expressions.numberTemplate(Integer.class, "dayofweek({0})", post.createDate);
        NumberExpression<Integer> hour = Expressions.numberTemplate(Integer.class, "hour({0})", post.createDate);

        JPQLQuery<Post> query = from(post).where(post.createDate.goe(since));

        JPQLQuery<Tuple> tuple = query.select(day, hour, post.postId.count());

        tuple.groupBy(day, hour);
        List<Tuple> list = tuple.fetch();

        return list.stream().map(Tuple::toArray).collect(Collectors.toList());
    }

}
