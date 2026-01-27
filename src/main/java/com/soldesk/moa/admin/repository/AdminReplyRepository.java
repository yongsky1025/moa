package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.admin.temporary.Reply;

public interface AdminReplyRepository extends JpaRepository<Reply, Long> {

}
