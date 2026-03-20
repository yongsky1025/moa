package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostSearchDTO;
import com.soldesk.moa.board.entity.QBoard;
import com.soldesk.moa.board.entity.QPost;
import com.soldesk.moa.board.entity.QReply;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.users.entity.QUsers;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AdminPostSearchRepositoryImpl implements AdminPostSearchRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Tuple> searchAdminPosts(AdminPostSearchDTO searchDTO, Pageable pageable) {
        QPost post = QPost.post;
        QBoard board = QBoard.board;
        QReply reply = QReply.reply;
        QUsers user = QUsers.users;
        QCircle circle = QCircle.circle;

        BooleanBuilder builder = new BooleanBuilder();

        // 게시판 타입 필터
        if (searchDTO.getBoardType() != null) {
            builder.and(board.boardType.eq(searchDTO.getBoardType()));
        }

        // 삭제 여부 필터
        if (searchDTO.getDeleted() != null) {
            builder.and(post.deleted.eq(searchDTO.getDeleted()));
        }

        // 작성일 범위 필터
        if (searchDTO.getStartDate() != null) {
            builder.and(post.createDate.goe(searchDTO.getStartDate().atStartOfDay()));
        }
        if (searchDTO.getEndDate() != null) {
            builder.and(post.createDate.loe(searchDTO.getEndDate().atTime(LocalTime.MAX)));
        }

        // 동아리 2차 필터
        if (searchDTO.getCircleId() != null) {
            builder.and(board.circleId.circleId.eq(searchDTO.getCircleId()));
        }

        // 검색 (type: title, author, content)
        if (searchDTO.getKeyword() != null && !searchDTO.getKeyword().isBlank()) {
            String keyword = searchDTO.getKeyword().trim();
            switch (searchDTO.getType() != null ? searchDTO.getType() : "") {
                case "title" -> builder.and(post.title.contains(keyword));
                case "author" -> builder.and(user.name.contains(keyword));
                case "content" -> builder.and(post.content.contains(keyword));
                default -> builder.and(
                        post.title.contains(keyword)
                                .or(user.name.contains(keyword))
                                .or(post.content.contains(keyword)));
            }
        }

        // 정렬
        OrderSpecifier<?> orderBy = switch (searchDTO.getSort() != null ? searchDTO.getSort() : "newest") {
            case "views" -> post.viewCount.desc();
            case "replies" -> reply.count().desc();
            default -> post.createDate.desc();
        };

        // 데이터 조회
        List<Tuple> content = queryFactory
                .select(post, board.name, reply.count(), circle.name)
                .from(post)
                .join(post.boardId, board)
                .join(post.userId, user)
                .leftJoin(reply).on(reply.postId.eq(post).and(reply.deleted.eq(false)))
                .leftJoin(board.circleId, circle)
                .where(builder)
                .groupBy(post)
                .orderBy(orderBy)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 총 개수 조회
        Long total = queryFactory
                .select(post.count())
                .from(post)
                .join(post.boardId, board)
                .join(post.userId, user)
                .leftJoin(board.circleId, circle)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }
}
