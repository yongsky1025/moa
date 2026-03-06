package com.soldesk.moa.admin.repository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.querydsl.core.Tuple;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.admin.temporary.QReply;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.QBoard;
import com.soldesk.moa.board.entity.QPost;
import com.soldesk.moa.users.entity.QUsers;

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
                .leftJoin(reply).on(reply.post.eq(post))
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

}
