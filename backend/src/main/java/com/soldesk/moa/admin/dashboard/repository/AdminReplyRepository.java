package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.board.entity.Reply;

public interface AdminReplyRepository extends JpaRepository<Reply, Long>, SearchReplyRepository {

    @Query("select r, p.title from Reply r join r.postId p where r.userId.userId = :userId")
    Page<Object[]> getReplyByUserId(Long userId, Pageable pageable);

    // 오늘 댓글 수(삭제 포함 x)
    @Query("select count(r) from Reply r where r.deleted = false and r.createDate >= :start and r.createDate <= :end")
    long countTodayReplies(LocalDateTime start, LocalDateTime end);

    // 게시글의 댓글 목록 조회 (대댓글 포함)
    List<Reply> findByPostId_PostIdOrderByCreateDateAsc(Long postId);
}
