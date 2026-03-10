package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.entity.Post;

public interface AdminPostRepository extends JpaRepository<Post, Long>, SearchPostRepository {

    // 오늘 게시글 수
    long countTodayPosts(LocalDateTime start, LocalDateTime end);
}
