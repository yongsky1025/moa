package com.soldesk.moa.post.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.post.entity.PostReaction;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    Optional<PostReaction> findByPost_PostIdAndUser_UserId(Long postId, Long userId);
}
