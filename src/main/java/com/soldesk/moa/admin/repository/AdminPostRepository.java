package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.entity.Post;

public interface AdminPostRepository extends JpaRepository<Post, Long>, SearchPostRepository {

}
