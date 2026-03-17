package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.board.reply.entity.Reply;

public interface AdminReplyRepository extends JpaRepository<Reply, Long> {

    @Query("select r, p.title from Reply r join r.postId p where r.userId.userId = :userId")
    Page<Object[]> getReplyByUserId(Long userId, Pageable pageable);
}
