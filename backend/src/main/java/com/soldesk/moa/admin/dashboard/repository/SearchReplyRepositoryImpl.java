package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.StringTemplate;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.reply.entity.QReply;
import com.soldesk.moa.reply.entity.Reply;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class SearchReplyRepositoryImpl extends QuerydslRepositorySupport implements SearchReplyRepository {

    public SearchReplyRepositoryImpl() {
        super(Reply.class);
    }

    @Override
    public List<Tuple> countRepliesGroupedByDay(LocalDate day) {
        QReply reply = QReply.reply;

        LocalDateTime fromDt = day.atStartOfDay();

        StringTemplate dateExpr = Expressions.stringTemplate("DATE({0})", reply.createDate);

        JPQLQuery<Reply> query = from(reply);
        JPQLQuery<Tuple> tuple = query.select(dateExpr, reply.replyId.count());
        tuple.where(reply.createDate.goe(fromDt).and(reply.deleted.eq(false)));
        tuple.groupBy(dateExpr);
        tuple.orderBy(dateExpr.asc());

        return tuple.fetch();
    }

    @Override
    public List<Object[]> findReplyActivity(LocalDateTime since) {

        QReply reply = QReply.reply;

        NumberExpression<Integer> hour = Expressions.numberTemplate(Integer.class, "hour({0})",
                reply.createDate);

        NumberExpression<Integer> day = Expressions.numberTemplate(Integer.class, "dayofweek({0})",
                reply.createDate);

        JPQLQuery<Reply> query = from(reply).where(reply.createDate.goe(since));

        JPQLQuery<Tuple> tuple = query.select(day, hour, reply.count());

        tuple.groupBy(day, hour);
        List<Tuple> list = tuple.fetch();

        return list.stream().map(Tuple::toArray).collect(Collectors.toList());

    }

}
