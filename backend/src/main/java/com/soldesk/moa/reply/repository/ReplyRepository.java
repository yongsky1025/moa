package com.soldesk.moa.reply.repository;

import java.util.List;

import com.soldesk.moa.board.entity.constant.BoardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.reply.entity.Reply;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // 게시글별 댓글 목록 (작성일 순)
    List<Reply> findByPostId_PostIdOrderByCreateDateAsc(Long postId);
    Page<Reply> findByPostId_PostIdOrderByCreateDateAscReplyIdAsc(Long postId, Pageable pageable);

    @Query("""
            select r.parentId.replyId, count(r)
            from Reply r
            where r.postId.postId = :postId
              and r.parentId is not null
            group by r.parentId.replyId
            """)
    List<Object[]> countChildRepliesByParentId(@Param("postId") Long postId);

    // 부모 댓글의 자식 댓글 삭제 (부모 삭제 전에 호출)
    void deleteByParentId_ReplyId(Long parentId);

    @Modifying
    @Query("update Reply r set r.parentId = null where r.parentId is not null")
    int unlinkParentReferences();

    // (선택) 게시글별 댓글 개수
    long countByPostId_PostId(Long postId);
    long countByPostId_PostIdAndDeletedFalse(Long postId);

    void deleteByPostId_PostId(Long postId);

    @Modifying
    @Query("""
            update Reply r
            set r.deleted = true,
                r.updateDate = CURRENT_TIMESTAMP
            where r.postId.postId = :postId
              and r.deleted = false
            """)
    int softDeleteByPostId(@Param("postId") Long postId);

    @Modifying
    @Query("""
            update Reply r
            set r.deleted = true,
                r.updateDate = CURRENT_TIMESTAMP
            where r.postId.boardId.boardId = :boardId
              and r.deleted = false
            """)
    int softDeleteByBoardId(@Param("boardId") Long boardId);

    @Modifying
    @Query("""
            update Reply r
            set r.parentId = null
            where r.deleted = true
              and r.updateDate < :cutoff
              and r.parentId is not null
            """)
    int unlinkParentReferencesForHardDelete(@Param("cutoff") java.time.LocalDateTime cutoff);

    @Modifying
    @Query("""
            delete from Reply r
            where r.deleted = true
              and r.updateDate < :cutoff
            """)
    int hardDeleteSoftDeletedBefore(@Param("cutoff") java.time.LocalDateTime cutoff);

    @Modifying
    @Query("update Reply r set r.likeCount = r.likeCount + 1 where r.replyId = :replyId")
    int incrementLikeCount(@Param("replyId") Long replyId);

    @Modifying
    @Query("update Reply r set r.likeCount = r.likeCount - 1 where r.replyId = :replyId and r.likeCount > 0")
    int decrementLikeCount(@Param("replyId") Long replyId);

    @Query("""
            select r
            from Reply r
            join fetch r.postId p
            join fetch p.boardId b
            where r.userId.userId = :userId
              and r.deleted = false
              and p.deleted = false
              and b.deleted = false
              and (
                   (:boardType is null and b.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE))
                or (:boardType is not null and b.boardType = :boardType)
              )
            order by r.createDate desc, r.replyId desc
            """)
    List<Reply> findMyCommunityReplies(
            @Param("userId") Long userId,
            @Param("boardType") BoardType boardType);

}
