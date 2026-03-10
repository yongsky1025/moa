package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringTemplate;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.board.entity.QReply;
import com.soldesk.moa.board.entity.Reply;

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
        tuple.where(reply.createDate.goe(fromDt));
        tuple.groupBy(dateExpr);
        tuple.orderBy(dateExpr.asc());

        return tuple.fetch();
    }

}
