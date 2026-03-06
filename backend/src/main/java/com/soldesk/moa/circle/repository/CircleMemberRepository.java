package com.soldesk.moa.circle.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.CircleMember;

public interface CircleMemberRepository extends JpaRepository<CircleMember, Long> {

    // ⚠️ CircleMember/Users/PK 필드명에 맞춰 수정 필요
    boolean existsByCircle_CircleIdAndUser_UserId(Long circleId, Long userId);
    // boolean existsByCircleId_CircleIdAndUserId_UserId(Long circleId, Long
    // userId);
}
