package com.soldesk.moa.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.post.entity.PostViewLog;

public interface PostViewLogRepository extends JpaRepository<PostViewLog, Long> {
}
