package com.soldesk.moa.board.reply.repository;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.reply.entity.Reply;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // 게시글별 댓글 목록 (작성일 순)
    List<Reply> findByPostId_PostIdAndDeletedFalseOrderByCreateDateAsc(Long postId);

    // 부모 댓글의 자식 댓글 삭제 (부모 삭제 전에 호출)
    void deleteByParentId_ReplyId(Long parentId);

    // (선택) 게시글별 댓글 개수
    long countByPostId_PostId(Long postId);

    void deleteByPostId_PostId(Long postId);

    long deleteByDeletedTrueAndDeletedAtBefore(LocalDateTime cutoff);

    @Modifying
    @Query("""
            update Reply r
            set r.deleted = true,
                r.deletedAt = :deletedAt
            where r.postId.postId = :postId
              and r.deleted = false
            """)
    int softDeleteByPostId(@Param("postId") Long postId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("""
            update Reply r
            set r.deleted = true,
                r.deletedAt = :deletedAt
            where r.postId.boardId.boardId = :boardId
              and r.deleted = false
            """)
    int softDeleteByBoardId(@Param("boardId") Long boardId, @Param("deletedAt") LocalDateTime deletedAt);

}
