package com.soldesk.moa.admin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.admin.temporary.Reply;

public interface AdminReplyRepository extends JpaRepository<Reply, Long> {

    @Query("select r, p.title from Reply r join r.post p where r.user.userId = :userId")
    Page<Object[]> getReplyByUserId(Long userId, Pageable pageable);
}
