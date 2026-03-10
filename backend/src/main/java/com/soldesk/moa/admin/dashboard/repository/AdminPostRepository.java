package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.entity.Post;

public interface AdminPostRepository extends JpaRepository<Post, Long>, SearchPostRepository {

}
