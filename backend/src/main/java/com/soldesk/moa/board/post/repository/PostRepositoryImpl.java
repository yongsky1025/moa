package com.soldesk.moa.board.post.repository;

import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.springframework.util.StringUtils;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPQLQuery;
import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.board.entity.QBoard;
import com.soldesk.moa.board.post.entity.QPost;
import com.soldesk.moa.board.post.entity.QPostImage;
import com.soldesk.moa.board.post.entity.constant.PostImageUsageType;
import com.soldesk.moa.board.reply.entity.QReply;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.image.entity.QImage;
import com.soldesk.moa.users.entity.QUsers;

public class PostRepositoryImpl extends QuerydslRepositorySupport implements PostSearchRepository {

    public PostRepositoryImpl() {
        super(Post.class);
    }

    @Override
    public Page<Object[]> searchPostsWithReplyCount(BoardType boardType, Long circleId, Long boardId, String keyword,
            Pageable pageable) {
        QPost post = QPost.post;
        QBoard board = QBoard.board;
        QReply reply = QReply.reply;
        NumberExpression<Long> replyCountExpr = reply.count();

        BooleanBuilder builder = buildPredicate(boardType, circleId, boardId, keyword);

        JPQLQuery<Tuple> query = from(post)
                .join(post.boardId, board)
                .leftJoin(reply).on(reply.postId.eq(post))
                .where(builder)
                .groupBy(post)
                .orderBy(post.postId.desc())
                .select(post, replyCountExpr);

        if (pageable.isPaged()) {
            query.offset(pageable.getOffset());
            query.limit(pageable.getPageSize());
        }

        List<Tuple> tuples = query.fetch();
        List<Object[]> content = tuples.stream()
                .map(tuple -> new Object[] { tuple.get(post), tuple.get(replyCountExpr) })
                .toList();

        long total = countPosts(boardType, circleId, boardId, keyword);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public Page<PostCardResponseDTO> searchPostCards(BoardType boardType, Long circleId, Long boardId, String keyword,
            Pageable pageable) {
        QPost post = QPost.post;
        QBoard board = QBoard.board;
        QUsers user = QUsers.users;
        QImage thumbnail = QImage.image;
        QPostImage postImage = QPostImage.postImage;
        QReply reply = QReply.reply;

        BooleanBuilder builder = buildPredicate(boardType, circleId, boardId, keyword);

        JPQLQuery<PostCardResponseDTO> query = from(post)
                .join(post.boardId, board)
                .join(post.userId, user)
                .leftJoin(post.postImages, postImage).on(postImage.usageType.eq(PostImageUsageType.THUMBNAIL))
                .leftJoin(postImage.image, thumbnail)
                .leftJoin(reply).on(reply.postId.eq(post))
                .where(builder)
                .groupBy(
                        post.postId,
                        board.boardId,
                        board.name,
                        post.title,
                        user.name,
                        thumbnail.path,
                        post.createDate,
                        post.viewCount)
                .orderBy(post.postId.desc())
                .select(Projections.constructor(
                        PostCardResponseDTO.class,
                        post.postId,
                        board.boardId,
                        board.name,
                        post.title,
                        user.name,
                        thumbnail.path,
                        post.createDate,
                        post.viewCount,
                        reply.count()));

        if (pageable.isPaged()) {
            query.offset(pageable.getOffset());
            query.limit(pageable.getPageSize());
        }

        List<PostCardResponseDTO> content = query.fetch();
        long total = countPosts(boardType, circleId, boardId, keyword);
        return new PageImpl<>(content, pageable, total);
    }

    private BooleanBuilder buildPredicate(BoardType boardType, Long circleId, Long boardId, String keyword) {
        QPost post = QPost.post;
        QBoard board = QBoard.board;

        BooleanBuilder builder = new BooleanBuilder();

        if (boardType == BoardType.CIRCLE) {
            builder.and(board.boardType.eq(BoardType.CIRCLE));
            if (circleId != null) {
                builder.and(board.circleId.circleId.eq(circleId));
            }
            if (boardId != null) {
                builder.and(board.boardId.eq(boardId));
            }
        } else {
            builder.and(board.boardType.eq(boardType));
            builder.and(board.circleId.isNull());
        }

        if (StringUtils.hasText(keyword)) {
            String normalizedKeyword = keyword.trim();
            builder.and(post.title.containsIgnoreCase(normalizedKeyword)
                    .or(post.content.containsIgnoreCase(normalizedKeyword)));
        }

        return builder;
    }

    private long countPosts(BoardType boardType, Long circleId, Long boardId, String keyword) {
        QPost post = QPost.post;
        QBoard board = QBoard.board;

        Long count = from(post)
                .join(post.boardId, board)
                .where(buildPredicate(boardType, circleId, boardId, keyword))
                .select(post.postId.countDistinct())
                .fetchOne();

        return Objects.requireNonNullElse(count, 0L);
    }
}
