package com.soldesk.moa.post.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.post.entity.PostSearchEntity;

public interface PostSearchRepository extends JpaRepository<PostSearchEntity, Long> {

    @Query(value = """
        select ps
        from PostSearchEntity ps
        join Post p on p.postId = ps.postId
        where p.deleted = false
          and p.boardId.deleted = false
          and (
               :keyword = ''
               or (
                   :target = 'ALL'
                   and (
                       lower(ps.title) like lower(concat('%', :keyword, '%'))
                       or ps.content like concat('%', :keyword, '%')
                       or lower(ps.titleChosung) like lower(concat('%', :keyword, '%'))
                       or ps.contentChosung like concat('%', :keyword, '%')
                   )
               )
               or (
                   :target = 'TITLE'
                   and (
                       lower(ps.title) like lower(concat('%', :keyword, '%'))
                       or lower(ps.titleChosung) like lower(concat('%', :keyword, '%'))
                   )
               )
               or (
                   :target = 'CONTENT'
                   and (
                       ps.content like concat('%', :keyword, '%')
                       or ps.contentChosung like concat('%', :keyword, '%')
                   )
               )
          )
          and (
               (:boardType is null and ps.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE))
            or (:boardType is not null and :boardType <> com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and ps.boardType = :boardType)
            or (:boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and ps.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and ps.circleId = :circleId)
          )
        order by ps.createDate desc
        """,
            countQuery = """
        select count(ps)
        from PostSearchEntity ps
        join Post p on p.postId = ps.postId
        where p.deleted = false
          and p.boardId.deleted = false
          and (
               :keyword = ''
               or (
                   :target = 'ALL'
                   and (
                       lower(ps.title) like lower(concat('%', :keyword, '%'))
                       or ps.content like concat('%', :keyword, '%')
                       or lower(ps.titleChosung) like lower(concat('%', :keyword, '%'))
                       or ps.contentChosung like concat('%', :keyword, '%')
                   )
               )
               or (
                   :target = 'TITLE'
                   and (
                       lower(ps.title) like lower(concat('%', :keyword, '%'))
                       or lower(ps.titleChosung) like lower(concat('%', :keyword, '%'))
                   )
               )
               or (
                   :target = 'CONTENT'
                   and (
                       ps.content like concat('%', :keyword, '%')
                       or ps.contentChosung like concat('%', :keyword, '%')
                   )
               )
          )
          and (
               (:boardType is null and ps.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE))
            or (:boardType is not null and :boardType <> com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and ps.boardType = :boardType)
            or (:boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and ps.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and ps.circleId = :circleId)
          )
        """)
    Page<PostSearchEntity> searchPostsForFallback(
            @Param("keyword") String keyword,
            @Param("target") String target,
            @Param("boardType") BoardType boardType,
            @Param("circleId") Long circleId,
            Pageable pageable);

    @Modifying
    @Query(value = """
            delete ps
            from post_search ps
            left join post p on p.post_id = ps.post_id and p.deleted = false
            where p.post_id is null
            """, nativeQuery = true)
    int deleteOrphanedRows();
}
