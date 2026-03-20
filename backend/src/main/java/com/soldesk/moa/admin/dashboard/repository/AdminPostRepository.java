package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.board.entity.Post;

public interface AdminPostRepository extends JpaRepository<Post, Long>, SearchPostRepository, AdminPostSearchRepository {

    // 오늘 게시글 수
    @Query("select count(p) from Post p where p.createDate >= :start and p.createDate <= :end")
    long countTodayPosts(LocalDateTime start, LocalDateTime end);

}
